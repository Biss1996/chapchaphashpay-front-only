const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

/* ------------------ STK PUSH ------------------ */
app.post("/stkpush", async (req, res) => {
  const { phone, amount, reference } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({
      success: false,
      message: "Phone and amount required",
    });
  }

  let formattedPhone = String(phone).trim();

  if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  }

  try {
    const response = await axios.post(
      "https://api.hashback.co.ke/initiatestk",
      {
        api_key: process.env.HASHPAY_API_KEY,
        account_id: process.env.HASHPAY_ACCOUNT_ID,
        amount: String(amount),
        msisdn: formattedPhone,
        reference: reference || `LOAN-${Date.now()}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("HashPay STK response:", response.data);

    return res.json(response.data);
  } catch (error) {
    console.error("HashPay STK error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "STK Push failed",
      error: error.response?.data || error.message,
    });
  }
});

/* ------------------ CHECK TRANSACTION STATUS ------------------ */
app.post("/transaction-status", async (req, res) => {
  const { checkoutId } = req.body;

  if (!checkoutId) {
    return res.status(400).json({
      success: false,
      message: "checkoutId is required",
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
      error: error.response?.data || error.message,
    });
  }
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});