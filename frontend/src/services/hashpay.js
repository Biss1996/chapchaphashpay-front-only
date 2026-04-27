import api from "../api";

/**
 * Initiates STK Push via backend (Flask)
 */
export const initiateSTKPush = async (phone, amount, reference) => {
  const res = await api.post("/pay", {
    phone,
    amount,
    reference,
  });

  return res.data;
};