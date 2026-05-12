import axios from "axios";

// TEMP MEMORY STORE
// Replace with DB later
global.payments = global.payments || {};

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      phone_number,
      amount,
      customer_name = "Customer",
    } = req.body;

    // VALIDATION
    if (!phone_number || !amount) {
      return res.status(400).json({
        error:
          "phone_number and amount required",
      });
    }

    // FORMAT PHONE
    const formattedPhone =
      phone_number.startsWith("+254")
        ? phone_number
        : phone_number.startsWith("0")
        ? `+254${phone_number.slice(1)}`
        : `+254${phone_number}`;

    // VALIDATE KENYAN PHONE
    const regex = /^\+254[17]\d{8}$/;

    if (!regex.test(formattedPhone)) {
      return res.status(400).json({
        error:
          "Invalid Kenyan phone number",
      });
    }

    // VALIDATE AMOUNT
    const parsedAmount = Number(amount);

    if (
      isNaN(parsedAmount) ||
      parsedAmount < 1
    ) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    // ENV CHECK
    if (
      !process.env.PAYHERO_AUTH ||
      !process.env.CHANNEL_ID
    ) {
      return res.status(500).json({
        error:
          "Missing PAYHERO_AUTH or CHANNEL_ID",
      });
    }

    // EXTERNAL REFERENCE
    const external_reference = `LOAN-${Date.now()}`;

    // PAYHERO REQUEST
    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount: parsedAmount,
        phone_number: formattedPhone,
        channel_id: Number(
          process.env.CHANNEL_ID
        ),
        provider: "m-pesa",
        external_reference,
        customer_name,

        callback_url: `${
          process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "https://chapchaphashpay.vercel.app"
        }/api/callback`,
      },
      {
        headers: {
          Authorization: `Basic ${process.env.PAYHERO_AUTH}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    console.log(
      "PAYHERO RESPONSE:",
      response.data
    );

    // GET CHECKOUT ID
    const checkoutId =
      response.data.CheckoutRequestID;

    // STORE PAYMENT TEMPORARILY
    global.payments[checkoutId] = {
      status: "PENDING",
      amount: parsedAmount,
      phone: formattedPhone,
      customer_name,
      createdAt: Date.now(),
      reference:
        response.data.reference,
    };

    return res.status(200).json({
      success: true,
      ...response.data,
    });
  } catch (error) {
    console.error(
      "STK PUSH ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data ||
        error.message,
    });
  }
}