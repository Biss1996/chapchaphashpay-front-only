export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const callbackData = req.body;
    console.log('PayHero Callback:', callbackData);

    // Here you would typically:
    // 1. Verify the callback is from PayHero (check IP, signature, etc.)
    // 2. Update your database with the payment status
    // 3. Send notifications to the user

    return res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('Callback Error:', error);
    return res.status(500).json({ error: 'Callback processing failed' });
  }
}