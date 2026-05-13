import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phone_number, amount, customer_name = "Customer" } = req.body;

    if (!phone_number || !amount) {
      return res.status(400).json({ error: "phone_number and amount required" });
    }

    const formattedPhone = phone_number.startsWith("+254")
      ? phone_number
      : phone_number.startsWith("0")
        ? `+254${phone_number.slice(1)}`
        : `+254${phone_number}`;

    const regex = /^\+254[17]\d{8}$/;
    if (!regex.test(formattedPhone)) {
      return res.status(400).json({ error: "Invalid Kenyan phone number" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return res.status(400).json({ error: "Amount must be at least 10 KES" });
    }

    if (!process.env.PAYHERO_AUTH || !process.env.CHANNEL_ID) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const external_reference = `LOAN-${Date.now()}`;

    const callbackUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/callback`
      : "https://chapchaphashpay.vercel.app/api/callback";

    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount: parsedAmount,
        phone_number: formattedPhone,
        channel_id: Number(process.env.CHANNEL_ID),
        provider: "m-pesa",
        external_reference,
        customer_name,
        callback_url: callbackUrl
      },
      {
        headers: {
          Authorization: `Basic ${process.env.PAYHERO_AUTH}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const checkoutId = response.data.CheckoutRequestID;
    if (!checkoutId) {
      return res.status(500).json({ error: "No CheckoutRequestID received from PayHero" });
    }

    // Initialize global payments store
    global.payments = global.payments || {};
    global.payments[checkoutId] = {
      status: "PENDING",
      amount: parsedAmount,
      phone: formattedPhone,
      customer_name,
      createdAt: Date.now(),
      reference: response.data.reference
    };

    return res.status(200).json({
      success: true,
      CheckoutRequestID: checkoutId,
      reference: response.data.reference,
      status: "QUEUED"
    });

  } catch (error) {
    console.error("STK PUSH ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error_message ||
            error.response?.data ||
            error.message ||
            "Failed to initiate STK Push"
    });
  }
}