import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Example STK Push call
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