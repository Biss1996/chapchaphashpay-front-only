import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, phone_number, customer_name } = req.body;

    // Validate inputs
    if (!amount || !phone_number || !customer_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate Kenyan phone number
    const kenyanPhoneRegex = /^(\+254|0)[71]\d{8}$/;
    if (!kenyanPhoneRegex.test(phone_number)) {
      return res.status(400).json({ error: 'Invalid Kenyan phone number' });
    }

    // Format phone number for PayHero
    const formattedPhone = phone_number.startsWith('0')
      ? phone_number.replace('0', '+254')
      : phone_number;

    // PayHero API request
    const response = await axios.post(
      'https://backend.payhero.co.ke/api/v2/payments',
      {
        amount: parseInt(amount),
        phone_number: formattedPhone,
        channel_id: process.env.CHANNEL_ID,
        provider: 'm-pesa',
        external_reference: `LOAN-${Date.now()}`,
        customer_name,
        callback_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/callback`,
      },
      {
        headers: {
          Authorization: `Basic ${process.env.PAYHERO_AUTH}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('STK Push Error:', error.message);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.response?.data || error.message,
    });
  }
}