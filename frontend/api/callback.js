global.payments = global.payments || {};

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const callback = req.body;

    console.log(
      "PAYHERO CALLBACK:",
      JSON.stringify(
        callback,
        null,
        2
      )
    );

    /*
      EXPECTED CALLBACK STRUCTURE
      MAY DIFFER SLIGHTLY

      {
        CheckoutRequestID: "...",
        ResultCode: "0",
        ResultDesc: "Success"
      }
    */

    const checkoutId =
      callback.CheckoutRequestID ||
      callback.checkoutRequestID;

    const resultCode = String(
      callback.ResultCode || ""
    );

    // PAYMENT SUCCESS
    if (resultCode === "0") {
      if (
        global.payments[checkoutId]
      ) {
        global.payments[
          checkoutId
        ].status = "SUCCESS";

        global.payments[
          checkoutId
        ].callback = callback;
      }
    }

    // PAYMENT FAILED
    else {
      if (
        global.payments[checkoutId]
      ) {
        global.payments[
          checkoutId
        ].status = "FAILED";

        global.payments[
          checkoutId
        ].callback = callback;
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(
      "CALLBACK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
    });
  }
}