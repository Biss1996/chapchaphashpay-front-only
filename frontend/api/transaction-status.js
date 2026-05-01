import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

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

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("HashPay status error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Transaction status check failed",
    });
  }
}