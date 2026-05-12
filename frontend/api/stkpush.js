// src/api/stkpush.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, amount, customer_name = 'Customer' } = req.body;

    // Validate required fields
    if (!phone_number || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'phone_number and amount are required'
      });
    }

    // Format phone number to +2547XXXXXXXX
    const formattedPhone = phone_number.startsWith('+254')
      ? phone_number
      : phone_number.startsWith('0')
        ? `+254${phone_number.slice(1)}`
        : `+254${phone_number}`;

    // Validate Kenyan phone number (Safaricom: 7, Airtel: 1, Telkom: 2)
    const kenyanPhoneRegex = /^\+254[127]\d{8}$/;
    if (!kenyanPhoneRegex.test(formattedPhone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        details: 'Phone number must be in format +2547XXXXXXXX, +2541XXXXXXXX, or +2542XXXXXXXX'
      });
    }

    // Validate amount (PayHero requires 10 <= amount <= 150000)
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10 || parsedAmount > 150000) {
      return res.status(400).json({
        error: 'Invalid amount',
        details: 'Amount must be between 10 and 150000 KES'
      });
    }

    // Validate environment variables
    if (!process.env.PAYHERO_AUTH || !process.env.CHANNEL_ID) {
      return res.status(500).json({
        error: 'Server misconfiguration',
        details: 'PAYHERO_AUTH or CHANNEL_ID environment variables are missing'
      });
    }

    // PayHero API request
    const response = await axios.post(
      'https://backend.payhero.co.ke/api/v2/payments',
      {
        amount: parsedAmount,
        phone_number: formattedPhone,
        channel_id: parseInt(process.env.CHANNEL_ID), // Ensure it's a number
        provider: 'm-pesa', // Must be lowercase
        external_reference: `LOAN-${Date.now()}`,
        customer_name: customer_name,
        callback_url: `${process.env.VERCEL_URL || 'https://chapchaphashpay.vercel.app'}/api/callback`
      },
      {
        headers: {
          'Authorization': `Basic ${process.env.PAYHERO_AUTH}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return res.status(200).json({
      success: true,
      ...response.data,
      formattedPhone: formattedPhone
    });

  } catch (error) {
    console.error('PayHero API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    // Handle PayHero errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'PayHero API Error',
        status: error.response.status,
        details: error.response.data,
        advice: getErrorAdvice(error.response.status, error.response.data)
      });
    }

    return res.status(500).json({
      error: 'Failed to process STK Push',
      details: error.message
    });
  }
}

// Helper function for error messages
function getErrorAdvice(status, data) {
  if (status === 400) {
    if (data?.error_message?.includes('channel')) {
      return 'The CHANNEL_ID does not belong to your PayHero account. Verify your CHANNEL_ID in the PayHero dashboard.';
    }
    if (data?.error_message?.includes('phone_number')) {
      return 'Invalid phone number format. Use +2547XXXXXXXX.';
    }
    if (data?.error_message?.includes('amount')) {
      return 'Amount must be between 10 and 150000 KES.';
    }
    return 'Check all request parameters for errors.';
  }
  if (status === 401) {
    return 'Invalid PAYHERO_AUTH credentials. Re-encode your username:password in Base64.';
  }
  return 'Contact PayHero support if the issue persists.';
}