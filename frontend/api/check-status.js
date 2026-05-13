// api/status.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { checkoutId } = req.query;

    if (!checkoutId) {
      return res.status(400).json({ error: "Checkout ID required" });
    }

    const payment = global.payments[checkoutId];

    // NOT FOUND YET (return pending)
    if (!payment) {
      return res.status(200).json({
        ResultCode: "",
        ResultDesc: "Payment not found",
        status: "PENDING"
      });
    }

    // SUCCESS
    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        ResultCode: "0",
        ResultDesc: "Payment successful",
        status: "COMPLETED",
        reference: payment.reference,
        amount: payment.amount,
        phone: payment.phone
      });
    }

    // FAILED
    if (payment.status === "FAILED") {
      return res.status(200).json({
        ResultCode: "1032",
        ResultDesc: payment.callback?.ResultDesc || "Payment failed",
        status: "FAILED"
      });
    }

    // DEFAULT PENDING
    return res.status(200).json({
      ResultCode: "",
      ResultDesc: "Payment pending",
      status: "PENDING"
    });

  } catch (error) {
    console.error("STATUS CHECK ERROR:", error);
    return res.status(500).json({
      error: "Failed to check payment status",
      details: error.message
    });
  }
}