
import axios from "axios";

function normalizeKenyanPhone(phone) {
  let cleaned = String(phone || "").replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }

  if (!/^254[17]\d{8}$/.test(cleaned)) {
    throw new Error("Invalid Kenyan phone number. Use 07XXXXXXXX or 01XXXXXXXX.");
  }

  return cleaned;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      phone_number,
      amount,
      customer_name = "Customer"
    } = req.body || {};

    if (!phone_number || amount === undefined || amount === null) {
      return res.status(400).json({
        error: "phone_number and amount are required"
      });
    }

    const formattedPhone = normalizeKenyanPhone(phone_number);

    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedAmount) || parsedAmount < 10) {
      return res.status(400).json({
        error: "Amount must be a whole number of at least 10 KES"
      });
    }

    const rawToken = process.env.PAYHERO_AUTH_TOKEN;
    const channelId = Number(process.env.PAYHERO_CHANNEL_ID);

    if (!rawToken || !Number.isInteger(channelId) || channelId <= 0) {
      console.error("Missing PayHero environment variables");

      return res.status(500).json({
        error: "Payment service is not configured"
      });
    }

    // Avoid accidentally adding Basic twice.
    const authorization = rawToken.trim().startsWith("Basic ")
      ? rawToken.trim()
      : `Basic ${rawToken.trim()}`;

    const external_reference = `LOAN-${Date.now()}`;

    const payload = {
      amount: parsedAmount,
      phone_number: formattedPhone,
      channel_id: channelId,
      provider: "m-pesa",
      external_reference,
      customer_name
    };

    // Only include callback URL if explicitly configured.
    if (process.env.PAYHERO_CALLBACK_URL) {
      payload.callback_url = process.env.PAYHERO_CALLBACK_URL;
    }

    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      payload,
      {
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const reference = response.data?.reference;
    const checkoutId = response.data?.CheckoutRequestID;

    if (!reference) {
      console.error("PayHero response missing reference:", response.data);

      return res.status(502).json({
        error: "PayHero did not return a transaction reference"
      });
    }

    return res.status(200).json({
      success: true,
      status: response.data.status || "QUEUED",
      reference,
      checkout_request_id: checkoutId || null,
      external_reference,
      message: "STK Push request submitted successfully"
    });

  } catch (error) {
  const payheroStatus = error.response?.status;
  const payheroData = error.response?.data;

  console.error("PAYHERO STK PUSH ERROR:", {
    status: payheroStatus,
    data: payheroData,
    message: error.message,
  });

  return res.status(502).json({
    success: false,
    error: "PayHero rejected the STK Push request.",
    details: payheroData || error.message,
    payhero_status: payheroStatus || null,
  });
}
}
