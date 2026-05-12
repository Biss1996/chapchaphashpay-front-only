import axios from "axios";

// AXIOS INSTANCE
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error);

    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message:
          error.response.data?.message ||
          error.response.data?.error ||
          "Request failed",
        data: error.response.data,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message:
          "Network error. Please check your internet connection.",
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || "Unknown error occurred",
    });
  }
);

// FORMAT PHONE NUMBER
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\s+/g, "");

  // +254712345678
  if (cleaned.startsWith("+254")) {
    return cleaned;
  }

  // 254712345678
  if (cleaned.startsWith("254")) {
    return `+${cleaned}`;
  }

  // 0712345678
  if (cleaned.startsWith("0")) {
    return `+254${cleaned.slice(1)}`;
  }

  // 712345678
  return `+254${cleaned}`;
};

// VALIDATE KENYAN PHONE
export const validateKenyanPhone = (phone) => {
  const regex = /^(\+254|254|0)[17]\d{8}$/;
  return regex.test(phone);
};

// INITIATE STK PUSH
export const initiateSTKPush = async (
  phone,
  amount,
  customerName = "Customer"
) => {
  try {
    const formattedPhone =
      formatPhoneNumber(phone);

    // VALIDATE PHONE
    if (
      !validateKenyanPhone(formattedPhone)
    ) {
      throw new Error(
        "Invalid Kenyan phone number"
      );
    }

    // VALIDATE AMOUNT
    if (!amount || amount <= 0) {
      throw new Error(
        "Invalid payment amount"
      );
    }

    const payload = {
      phone_number: formattedPhone,
      amount: Number(amount),
      customer_name: customerName,
      external_reference: `LOAN-${Date.now()}`,
    };

    console.log(
      "STK PUSH PAYLOAD:",
      payload
    );

    const response = await api.post(
      "/stkpush",
      payload
    );

    console.log(
      "STK PUSH RESPONSE:",
      response.data
    );

    // VALIDATE RESPONSE
    const checkoutId =
      response.data?.CheckoutRequestID ||
      response.data?.checkoutRequestID ||
      response.data?.checkout_id ||
      response.data?.CheckoutID;

    if (!checkoutId) {
      throw new Error(
        "No CheckoutRequestID received"
      );
    }

    return {
      success: true,
      ...response.data,
      CheckoutRequestID: checkoutId,
    };
  } catch (error) {
    console.error(
      "INITIATE STK ERROR:",
      error
    );

    throw {
      success: false,
      message:
        error.message ||
        "Failed to initiate payment",
      status: error.status || 500,
    };
  }
};

// CHECK PAYMENT STATUS
export const checkTransactionStatus =
  async (checkoutId) => {
    try {
      if (!checkoutId) {
        throw new Error(
          "CheckoutRequestID is required"
        );
      }

      console.log(
        "CHECKING STATUS FOR:",
        checkoutId
      );

      const response = await api.get(
        `/check-status?checkoutId=${checkoutId}`
      );

      console.log(
        "STATUS RESPONSE:",
        response.data
      );

      /*
        EXPECTED RESPONSE:

        SUCCESS:
        {
          ResultCode: "0",
          ResultDesc: "Payment successful",
          status: "SUCCESS"
        }

        PENDING:
        {
          ResultCode: "",
          status: "PENDING"
        }

        FAILED:
        {
          ResultCode: "1032",
          status: "FAILED"
        }
      */

      return response.data;
    } catch (error) {
      console.error(
        "STATUS CHECK ERROR:",
        error
      );

      return {
        ResultCode: "",
        ResultDesc:
          error.message ||
          "Unable to verify payment",
        status: "PENDING",
      };
    }
  };

// OPTIONAL:
// VERIFY PAYMENT COMPLETED
export const verifyPaymentCompleted =
  (response) => {
    const resultCode = String(
      response?.ResultCode ||
        response?.result_code ||
        ""
    );

    const responseCode = String(
      response?.ResponseCode ||
        response?.response_code ||
        ""
    );

    return (
      resultCode === "0" ||
      responseCode === "0"
    );
  };

// OPTIONAL:
// CHECK IF PAYMENT FAILED
export const isPaymentFailed = (
  response
) => {
  const resultCode = String(
    response?.ResultCode ||
      response?.result_code ||
      ""
  );

  return [
    "1",
    "1032",
    "2001",
    "1037",
  ].includes(resultCode);
};

export default api;