import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const initiateSTKPush = async (amount, phoneNumber, customerName) => {
  try {
    const response = await api.post('/stkpush', {
      amount,
      phone_number: phoneNumber,
      customer_name: customerName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;