import axios from "axios";

const API = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const initiateSTKPush = async (phone, amount, reference = "PAYMENT") => {
  try {
    const res = await API.post("/api/stkpush", {
      phone,
      amount,
      reference,
    });

    return res.data;
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Payment request failed",
    };
  }
};

export const checkTransactionStatus = async (checkoutId) => {
  try {
    const res = await API.post("/api/transaction-status", {
      checkoutId,
    });

    return res.data;
  } catch (error) {
    console.error("Status Check Error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Status check failed",
    };
  }
};

export default API;