// src/api/stkpush.js
import axios from 'axios';

export default async function handler(req, res) {
  // Vercel Serverless Functions use req.method (not req.method)
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      details: 'Only POST requests are accepted'
    });
  }

  try {
    // Parse body (Vercel automatically parses JSON)
    const {
      phone_number,
      amount,
      customer_name = 'Customer',
      external_reference = `LOAN-${Date.now()}`
    } = req.body;

    // Validate required fields
    if (!phone_number || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'phone_number and amount are required'
      });
    }

    // Format Kenyan phone number
    const formattedPhone = phone_number.startsWith('+254')
      ? phone_number
      : phone_number.startsWith('0')
        ? `+254${phone_number.slice(1)}`
        : `+254${phone_number}`; // Fallback: assume it's a local number without 0

    // Validate phone number format (Safaricom/Airtel)
    const kenyanPhoneRegex = /^\+254[17]\d{8}$/;
    if (!kenyanPhoneRegex.test(formattedPhone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        details: 'Phone number must be a valid Kenyan number (e.g., +254712345678 or 0712345678)'
      });
    }

    // Validate amount (must be a positive integer)
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        details: 'Amount must be a positive number'
      });
    }

    // PayHero API request
    const payheroResponse = await axios.post(
      'https://backend.payhero.co.ke/api/v2/payments',
      {
        amount: parsedAmount,
        phone_number: formattedPhone,
        channel_id: parseInt(process.env.CHANNEL_ID), // Ensure it's a number
        provider: 'm-pesa',
        external_reference: external_reference,
        customer_name: customer_name,
        callback_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/callback`
      },
      {
        headers: {
          'Authorization': `Basic ${process.env.PAYHERO_AUTH}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10-second timeout
      }
    );

    // Return success response to client
    return res.status(200).json({
      success: true,
      ...payheroResponse.data,
      formattedPhone: formattedPhone,
      amount: parsedAmount
    });

  } catch (error) {
    console.error('PayHero API Error:', error.response?.data || error.message);

    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: 'PayHero API Error',
        details: error.response.data,
        status: error.response.status,
        advice: 'Check your PayHero credentials and request parameters'
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        error: 'PayHero API Unavailable',
        details: 'No response received from PayHero',
        advice: 'Check your internet connection or PayHero API status'
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: 'Failed to process STK Push',
        details: error.message,
        advice: 'Check your server configuration'
      });
    }
  }
}