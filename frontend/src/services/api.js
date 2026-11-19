
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

  let cleaned = String(phone).replace(/[\s-]/g, "");

  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (/^[17]\d{8}$/.test(cleaned)) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
};

// VALIDATE KENYAN PHONE
export const validateKenyanPhone = (phone) => {
  const formatted = formatPhoneNumber(phone);
  return /^254[17]\d{8}$/.test(formatted);
};

// INITIATE PAYHERO STK PUSH
export const initiateSTKPush = async (
  phone,
  amount,
  customerName = "Customer"
) => {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    if (!validateKenyanPhone(phone)) {
      throw new Error("Invalid Kenyan phone number");
    }

    const numericAmount = Number(amount);

    if (
      !Number.isInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      throw new Error("Invalid payment amount");
    }

    const payload = {
      phone_number: formattedPhone,
      amount: numericAmount,
      customer_name: customerName,
    };

    console.log("PAYHERO STK REQUEST:", {
      ...payload,
      phone_number: "**********",
    });

    const response = await api.post(
      "/stk-push",
      payload
    );

    const data = response.data;

    if (
      !data?.success ||
      !data?.reference
    ) {
      throw new Error(
        data?.message || "Unable to initiate STK Push"
      );
    }

    console.log("PAYHERO STK RESPONSE:", {
      status: data.status,
      reference: data.reference,
      checkout_request_id: data.checkout_request_id,
    });

    return {
      ...data,
      success: true,
      reference: data.reference,
      CheckoutRequestID:
        data.checkout_request_id || null,
    };

  } catch (error) {
    console.error("INITIATE STK ERROR:", error);

    throw {
      success: false,
      message:
        error.message || "Failed to initiate payment",
      status: error.status || 500,
    };
  }
};

// CHECK PAYHERO TRANSACTION STATUS
export const checkTransactionStatus = async (
  reference
) => {
  try {
    if (!reference) {
      throw new Error("Transaction reference is required");
    }

    const response = await api.get("/status", {
      params: { reference },
    });

    const data = response.data;

    return {
      ...data,
      status: String(data.status || "").toUpperCase(),
      success: data.status === "SUCCESS",
    };

  } catch (error) {
    console.error("STATUS CHECK ERROR:", error);

    return {
      success: false,
      status: "UNKNOWN",
      message:
        error.message || "Unable to verify payment",
    };
  }
};

// VERIFY PAYMENT COMPLETED
export const verifyPaymentCompleted = (response) => {
  return (
    String(response?.status || "").toUpperCase() ===
    "SUCCESS"
  );
};

// CHECK IF PAYMENT FAILED
export const isPaymentFailed = (response) => {
  return (
    String(response?.status || "").toUpperCase() ===
    "FAILED"
  );
};

// CHECK IF PAYMENT IS STILL PENDING
export const isPaymentPending = (response) => {
  return (
    String(response?.status || "").toUpperCase() ===
    "QUEUED"
  );
};

export default api;
