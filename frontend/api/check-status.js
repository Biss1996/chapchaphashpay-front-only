import axios from "axios";

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

    /*
      TEMP MOCK SUCCESS

      Since PayHero callback persistence
      fails on serverless memory,
      we simulate successful payment
      after user pays.

      Replace with DB later.
    */

    return res.status(200).json({
      ResultCode: "0",
      ResponseCode: "0",
      ResultDesc:
        "Payment successful",
      CheckoutRequestID:
        checkoutId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to check status",
    });
  }
}