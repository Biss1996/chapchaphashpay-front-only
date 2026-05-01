import api from "../api";

export const initiateSTKPush = async (phone, amount, reference) => {
  try {
    const res = await api.post("/api/stkpush", {   // ✅ FIXED
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

export const checkHashpayStatus = async (checkoutId) => {
  try {
    const res = await api.post("/api/transaction-status", {  // ✅ FIXED
      checkoutId,
    });

    return res.data;
  } catch (error) {
    console.error("Status Check Error:", error);
    return {};
  }
};