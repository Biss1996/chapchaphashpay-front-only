
const PAYHERO_STATUS_URL =
  "https://backend.payhero.co.ke/api/v2/transaction-status";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const authToken = process.env.PAYHERO_AUTH_TOKEN;

  if (!authToken) {
    return res.status(500).json({
      success: false,
      message: "Payment service is not configured"
    });
  }

  const reference = String(req.query.reference || "").trim();

  if (!reference || reference.length > 150) {
    return res.status(400).json({
      success: false,
      message: "A valid transaction reference is required"
    });
  }

  try {
    const url = new URL(PAYHERO_STATUS_URL);
    url.searchParams.set("reference", reference);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: authToken
      },
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Unable to retrieve payment status",
        provider_status: response.status
      });
    }

    const status = String(data.status || "").toUpperCase();

    if (!["QUEUED", "SUCCESS", "FAILED"].includes(status)) {
      return res.status(502).json({
        success: false,
        message: "Unexpected payment status received"
      });
    }

    return res.status(200).json({
      success: status === "SUCCESS",
      status,
      reference: data.reference,
      provider: data.provider,
      transaction_date: data.transaction_date,
      payment_reference: data.payment_reference,
      provider_reference: data.provider_reference,
      third_party_reference: data.third_party_reference
    });

  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Payment status service unavailable"
    });
  }
}
