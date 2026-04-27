const axios = require("axios");

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
      "https://api.hashback.co.ke/initiatestk",
      {
        api_key: process.env.HASHPAY_API_KEY,
        account_id: process.env.HASHPAY_ACCOUNT_ID,
        amount: String(amount), // must be string
        msisdn: phone,          // ⚠️ field name must be msisdn
        reference: reference || `LOAN-${Date.now()}`
      },
      {
        headers: {
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
      error: error.response?.data || error.message,
    });
  }
});