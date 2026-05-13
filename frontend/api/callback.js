export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Callback received:", req.body);

    const { CheckoutRequestID, ResultCode, ResultDesc } = req.body;

    if (!CheckoutRequestID) {
      return res.status(400).json({ error: "CheckoutRequestID required" });
    }

    // Initialize global.payments if it doesn't exist
    global.payments = global.payments || {};

    // Update payment status
    global.payments[CheckoutRequestID] = {
      status: ResultCode === "0" ? "SUCCESS" : "FAILED",
      ResultDesc: ResultDesc || (ResultCode === "0" ? "Payment successful" : "Payment failed"),
      updatedAt: new Date().toISOString()
    };

    console.log(`Updated payment ${CheckoutRequestID} to ${ResultCode === "0" ? "SUCCESS" : "FAILED"}`);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: "Callback failed" });
  }
}