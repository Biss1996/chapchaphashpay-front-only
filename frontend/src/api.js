import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// STK Push
export const initiateSTKPush = async (phone, amount) => {
  try {
    const res = await API.post("/stkpush", {
      phone,
      amount,
    });

    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false };
  }
};

export default API;