import api from "../api";

/**
 * Initiates STK Push via backend (Flask)
 */
export const initiateSTKPush = async (phone, amount, reference) => {
  try {
    const res = await api.post("/stkpush", {
      phone,
      amount,
      reference,
    });

    return res.data;
  } catch (error) {
    console.error("STK Push Error:", error);
    return { success: false };
  }
};

/**
 * Checks transaction status via backend
 */
export const checkHashpayStatus = async (checkoutId) => {
  try {
    const res = await api.post("/transaction-status", {
      checkoutId,
    });

    return res.data;
  } catch (error) {
    console.error("Status Check Error:", error);
    return {};
  }
};