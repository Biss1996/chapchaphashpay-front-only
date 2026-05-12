global.payments = global.payments || {};

export default async function handler(
  req,
  res
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { checkoutId } = req.query;

    if (!checkoutId) {
      return res.status(400).json({
        error: "Checkout ID required",
      });
    }

    const payment =
      global.payments[checkoutId];

    // NOT FOUND YET
    if (!payment) {
      return res.status(200).json({
        status: "PENDING",
      });
    }

    // SUCCESS
    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        ResultCode: "0",
        ResponseCode: "0",
        ResultDesc:
          "Payment successful",
      });
    }

    // FAILED
    if (payment.status === "FAILED") {
      return res.status(200).json({
        ResultCode: "1032",
        ResponseCode: "1",
        ResultDesc:
          "Payment cancelled",
      });
    }

    // DEFAULT PENDING
    return res.status(200).json({
      status: "PENDING",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to check status",
    });
  }
}