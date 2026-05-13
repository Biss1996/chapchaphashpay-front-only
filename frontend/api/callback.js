// api/callback.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const callback = req.body;
    console.log("PAYHERO CALLBACK:", JSON.stringify(callback, null, 2));

    // Extract checkout ID (handle different possible field names)
    const checkoutId = callback.CheckoutRequestID ||
                      callback.checkoutRequestID ||
                      callback.checkout_id ||
                      callback.CheckoutID;

    if (!checkoutId) {
      return res.status(400).json({
        success: false,
        error: "No CheckoutRequestID in callback"
      });
    }

    // Extract result code (handle different possible field names)
    const resultCode = String(callback.ResultCode || callback.result_code || "");
    const resultDesc = callback.ResultDesc || callback.result_desc || "";

    // PAYMENT SUCCESS
    if (resultCode === "0") {
      if (global.payments[checkoutId]) {
        global.payments[checkoutId] = {
          ...global.payments[checkoutId],
          status: "SUCCESS",
          callback: callback,
          completedAt: Date.now()
        };
      }
      console.log(`Payment SUCCESS for ${checkoutId}`);
    }
    // PAYMENT FAILED
    else {
      if (global.payments[checkoutId]) {
        global.payments[checkoutId] = {
          ...global.payments[checkoutId],
          status: "FAILED",
          callback: callback,
          failedAt: Date.now()
        };
      }
      console.log(`Payment FAILED for ${checkoutId}: ${resultDesc}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("CALLBACK ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process callback"
    });
  }
}