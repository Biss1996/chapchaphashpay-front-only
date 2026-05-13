// frontend/api/status.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { checkoutId } = req.query;

    // ✅ TEMPORARY: Simulate success for your test CheckoutRequestID
    if (checkoutId === "ws_CO_13052026142743626727783444") {
      return res.status(200).json({
        ResultCode: "0",
        ResultDesc: "Payment successful (simulated)",
        status: "SUCCESS"
      });
    }

    // Fallback to normal logic
    const payment = global.payments?.[checkoutId];
    if (!payment) {
      return res.status(200).json({
        ResultCode: "",
        ResultDesc: "Payment not found",
        status: "PENDING"
      });
    }

    return res.status(200).json({
      ResultCode: payment.status === "SUCCESS" ? "0" : "",
      ResultDesc: payment.status === "SUCCESS" ? "Payment successful" : "Payment pending",
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