const express = require("express");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: [
      "https://talahashpay.vercel.app/",
      "https://talahashpay.com/",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "10kb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again later.",
  },
});

const speedLimiter = slowDown({
  windowMs: 10 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 1000,
});

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

const formatPhone = (phone) => {
  let formattedPhone = String(phone).trim();

  if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  }

  return formattedPhone;
};

const isValidKenyanPhone = (phone) => {
  return /^254(7|1)\d{8}$/.test(phone);
};

const cleanReference = (reference) => {
  if (!reference) return `LOAN-${Date.now()}`;

  return String(reference)
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 40);
};

/* ------------------ STK PUSH ------------------ */
app.post("/stkpush", paymentLimiter, speedLimiter, async (req, res) => {
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

  if (
    !Number.isFinite(amountNumber) ||
    amountNumber < 1 ||
    amountNumber > 10000
  ) {
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

    const hashpayData = response.data;

    console.log("HashPay STK response:", hashpayData);

    const checkoutId =
      hashpayData.checkout_id ||
      hashpayData.checkoutId ||
      hashpayData.CheckoutRequestID ||
      hashpayData.CheckoutID ||
      hashpayData.checkoutid;

    return res.json({
      success:
        Boolean(checkoutId) ||
        hashpayData.success === true ||
        hashpayData.success === "true",
      message: hashpayData.message || "STK push initiated",
      checkout_id: checkoutId,
    });
  } catch (error) {
    console.error("HashPay STK error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "STK Push failed",
    });
  }
});

/* ------------------ CHECK TRANSACTION STATUS ------------------ */
app.post("/transaction-status", paymentLimiter, async (req, res) => {
  const { checkoutId } = req.body;

  if (!checkoutId || typeof checkoutId !== "string") {
    return res.status(400).json({
      success: false,
      message: "checkoutId is required",
    });
  }

  if (!/^ws_CO_/i.test(checkoutId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid checkoutId",
    });
  }

  try {
    const response = await axios.post(
      "https://api.hashback.co.ke/transactionstatus",
      {
        api_key: process.env.HASHPAY_API_KEY,
        account_id: process.env.HASHPAY_ACCOUNT_ID,
        checkoutid: checkoutId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("HashPay status response:", response.data);

    return res.json(response.data);
  } catch (error) {
    console.error("HashPay status error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Transaction status check failed",
    });
  }
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});