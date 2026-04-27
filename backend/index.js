const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express(); // ✅ MUST COME BEFORE ROUTES

app.use(cors());
app.use(express.json());

/* ------------------ TEST ROUTE ------------------ */
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

  try {
    const response = await axios.post(
      "https://api.hashback.co.ke/stkpush", // ⚠️ confirm from docs
      {
        phone,
        amount,
        reference,
        callback_url: "https://talahashpay.onrender.com/callback"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HASHPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("HashPay response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("HashPay error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "STK Push failed",
      error: error.response?.data,
    });
  }
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});