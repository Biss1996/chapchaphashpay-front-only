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
      "https://api.hashback.co.ke/stkpush", // confirm from HashPay docs
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

    return res.json(response.data);

  } catch (error) {
    console.error("HashPay error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "STK Push failed",
      error: error.response?.data,
    });
  }
});