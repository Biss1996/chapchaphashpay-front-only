import axios from "axios";

const formatPhone = (phone) => {
  let p = String(phone).trim();

  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "254" + p.slice(1);

  return p;
};

const isValidKenyanPhone = (phone) => /^254(7|1)\d{8}$/.test(phone);

const cleanReference = (reference) => {
  if (!reference) return `PAY-${Date.now()}`;

  return String(reference)
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 40);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { phone, amount, reference } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({
      success: false,
      message: "Phone and amount required",
    });
  }

  const formattedPhone = formatPhone(phone);

  if (!isValidKenyanPhone(formattedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format",
    });
  }

  const amountNumber = Number(amount);

  if (!Number.isFinite(amountNumber) || amountNumber < 1 || amountNumber > 10000) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment amount",
    });
  }

  try {
    const response = await axios.post(
      "https://api.hashback.co.ke/initiatestk",
      {
        api_key: process.env.HASHPAY_API_KEY,
        account_id: process.env.HASHPAY_ACCOUNT_ID,
        amount: String(amountNumber),
        msisdn: formattedPhone,
        reference: cleanReference(reference),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const data = response.data;

    const checkoutId =
      data.checkout_id ||
      data.checkoutId ||
      data.CheckoutRequestID ||
      data.CheckoutID ||
      data.checkoutid;

    return res.status(200).json({
      success: Boolean(checkoutId) || data.success === true || data.success === "true",
      message: data.message || "STK push initiated",
      checkout_id: checkoutId,
      raw: data,
    });
  } catch (error) {
    console.error("HashPay STK error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "STK Push failed",
      error: error.response?.data || error.message,
    });
  }
}