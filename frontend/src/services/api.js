import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initiate STK Push
export const initiateSTKPush = async (phone, amount, customerName) => {
  try {
    const response = await api.post('/stkpush', {
      phone_number: phone,
      amount: amount,
      customer_name: customerName,
      external_reference: `LOAN-${Date.now()}`
    });
    return response.data;
  } catch (error) {
    console.error('STK Push Error:', error);
    throw error.response?.data || error.message;
  }
};

// Check transaction status (mock or real implementation)
export const checkTransactionStatus = async (checkoutId) => {
  // In production, you would call PayHero's status endpoint
  // For now, we'll use a mock that simulates the response
  return {
    ResultCode: "0",
    ResultDesc: "Payment received successfully",
    CheckoutRequestID: checkoutId,
    ResponseCode: "0"
  };
};

export default api;