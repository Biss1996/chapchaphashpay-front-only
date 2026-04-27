const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route (Render will hit this)
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// STK Push placeholder endpoint (you will connect real Daraja here)
app.post("/stkpush", (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({
      success: false,
      message: "Phone and amount required",
    });
  }

  // TODO: integrate real Safaricom STK Push here
  res.json({
    success: true,
    message: "STK Push initiated (demo)",
    data: {
      phone,
      amount,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});