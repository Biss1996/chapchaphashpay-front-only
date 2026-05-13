// frontend/api/status.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { checkoutId } = req.query;

    if (!checkoutId) {
      return res.status(400).json({ error: "Checkout ID required" });
    }

    // Check in-memory storage (or your database)
    const payment = global.payments?.[checkoutId];

    if (!payment) {
      return res.status(200).json({
        ResultCode: "",
        ResultDesc: "Payment not found",
        status: "PENDING"
      });
    }

    // Return payment status
    return res.status(200).json({
      ResultCode: payment.status === "SUCCESS" ? "0" : payment.status === "FAILED" ? "1032" : "",
      ResultDesc: payment.status === "SUCCESS" ? "Payment successful" :
                 payment.status === "FAILED" ? "Payment failed" : "Payment pending",
      status: payment.status
    });

  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      error: "Failed to check payment status",
      details: error.message
    });
  }
}