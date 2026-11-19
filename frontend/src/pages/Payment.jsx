import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  DollarSign,
  Phone,
  ShieldCheck,
  Clock,
  Loader2,
} from "lucide-react";

import Loader from "../components/Loader";
import Stepper from "../components/Stepper";

const MAX_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 3000;

// Convert 0712345678, 712345678, +254712345678 or 254712345678
// into the international format expected by our Vercel API.
const formatPhoneNumber = (phone) => {
  let value = String(phone || "").replace(/[\s()-]/g, "");

  if (value.startsWith("+")) value = value.slice(1);
  if (value.startsWith("0")) value = `254${value.slice(1)}`;
  else if (/^[17]\d{8}$/.test(value)) value = `254${value}`;

  return value;
};

const isValidKenyanPhone = (phone) =>
  /^254[17]\d{8}$/.test(formatPhoneNumber(phone));

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [paymentAttempts, setPaymentAttempts] = useState(0);

  const navigate = useNavigate();
  const pollTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const paymentInProgressRef = useRef(false);

  const steps = ["Select Amount", "Check Eligibility", "Pay Fee", "Success"];

  useEffect(() => {
    try {
      const loan = JSON.parse(sessionStorage.getItem("myLoan") || "null");
      const user = JSON.parse(sessionStorage.getItem("userData") || "null");

      if (!loan) {
        toast.error("No loan data found. Please start over.");
        navigate("/apply");
        return;
      }

      setFormData({ ...(user || {}), ...loan });
      setLoanData(loan);
    } catch (error) {
      console.error("Storage error:", error);
      toast.error("Failed to load loan data. Please try again.");
      navigate("/apply");
    }
  }, [navigate]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  // PayHero status endpoint expects the original PayHero "reference".
  // QUEUED = pending, SUCCESS = paid, FAILED = unsuccessful.
  const checkPaymentStatus = async (reference, attempt = 0) => {
    if (!reference) {
      setLoading(false);
      Swal.close();
      await Swal.fire({
        title: "Payment Reference Missing",
        text: "We could not retrieve the PayHero transaction reference. Please contact support before trying again.",
        icon: "error",
        confirmButtonColor: "#0ea5e9",
        allowOutsideClick: false,
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/status?reference=${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to retrieve payment status");
      }

      const status = String(data.status || "").toUpperCase();
      const nextAttempt = attempt + 1;

      if (mountedRef.current) {
        setPaymentAttempts(nextAttempt);
      }

      console.log("PayHero payment status:", {
        reference,
        status,
        attempt: nextAttempt,
      });

      if (status === "SUCCESS") {
        stopPolling();

        if (mountedRef.current) setLoading(false);
        Swal.close();

        sessionStorage.setItem("payment_status", "completed");
        sessionStorage.setItem("payment_reference", reference);
        sessionStorage.setItem("payment_time", new Date().toISOString());
        sessionStorage.setItem("myLoan", JSON.stringify(loanData));
        sessionStorage.setItem("userData", JSON.stringify(formData));

        toast.success("Payment successful! Redirecting...", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });

        setTimeout(() => {
          navigate("/success", { replace: true });
        }, 2000);

        return;
      }

      if (status === "FAILED") {
        stopPolling();
        sessionStorage.removeItem("payment_reference");
        sessionStorage.removeItem("payment_status");

        if (mountedRef.current) setLoading(false);
        Swal.close();

        await Swal.fire({
          title: "Payment Failed",
          text: "PayHero reports that this payment failed or was cancelled. You can try again if you have confirmed that no payment was deducted.",
          icon: "error",
          confirmButtonColor: "#0ea5e9",
          allowOutsideClick: false,
        });

        return;
      }

      if (status !== "QUEUED") {
        throw new Error("PayHero returned an unrecognized payment status");
      }

      if (nextAttempt >= MAX_ATTEMPTS) {
        stopPolling();

        if (mountedRef.current) setLoading(false);
        Swal.close();

        // Do not tell the customer to initiate another payment automatically.
        // The original transaction may still complete after the polling window.
        sessionStorage.setItem("payment_status", "pending");
        sessionStorage.setItem("payment_reference", reference);

        await Swal.fire({
          title: "Payment Still Pending",
          text: "We have not received a final payment result yet. Do not submit another STK request. Please check your M-Pesa messages or use the payment reference when contacting support.",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          allowOutsideClick: false,
        });

        return;
      }

      pollTimeoutRef.current = setTimeout(() => {
        checkPaymentStatus(reference, nextAttempt);
      }, POLL_INTERVAL_MS);
    } catch (error) {
      console.error("PayHero status check error:", error);

      const nextAttempt = attempt + 1;
      if (mountedRef.current) setPaymentAttempts(nextAttempt);

      if (nextAttempt >= MAX_ATTEMPTS) {
        stopPolling();

        if (mountedRef.current) setLoading(false);
        Swal.close();

        // Keep the reference so the transaction can be checked again later.
        sessionStorage.setItem("payment_status", "verification_pending");
        sessionStorage.setItem("payment_reference", reference);

        await Swal.fire({
          title: "Unable to Confirm Payment",
          text: "We could not reach the payment status service. Your payment may still be processing. Do not initiate another payment until you have checked your M-Pesa messages or confirmed the transaction with support.",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          allowOutsideClick: false,
        });

        return;
      }

      // Retry status lookup only. Never initiate another STK request here.
      pollTimeoutRef.current = setTimeout(() => {
        checkPaymentStatus(reference, nextAttempt);
      }, POLL_INTERVAL_MS);
    }
  };

  const handlePay = async () => {
    if (paymentInProgressRef.current) return;

    // If a previous request is still pending or could not be verified,
    // resume checking that transaction instead of sending another STK Push.
    const existingReference = sessionStorage.getItem("payment_reference");
    const existingPaymentStatus = sessionStorage.getItem("payment_status");

    if (
      existingReference &&
      ["pending", "verification_pending"].includes(existingPaymentStatus)
    ) {
      setLoading(true);
      setPaymentAttempts(0);
      Swal.fire({
        title: "Checking Existing Payment...",
        text: "We are checking your previous M-Pesa request. We will not send another STK Push.",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      await checkPaymentStatus(existingReference, 0);
      return;
    }

    if (!loanData || !formData) {
      toast.error("Missing loan or user data. Please start over.");
      return;
    }

    const phone = formatPhoneNumber(formData.phone_number);

    if (!isValidKenyanPhone(formData.phone_number)) {
      await Swal.fire({
        title: "Invalid Phone Number",
        text: "Please use a valid Kenyan phone number (e.g., 0712345678 or +254712345678).",
        icon: "error",
        confirmButtonColor: "#0ea5e9",
      });
      return;
    }

    const amount = Number(loanData.processing_fee);

    if (!Number.isInteger(amount) || amount <= 0) {
      await Swal.fire({
        title: "Invalid Payment Amount",
        text: "The processing fee is invalid. Please refresh or contact support.",
        icon: "error",
        confirmButtonColor: "#0ea5e9",
      });
      return;
    }

    paymentInProgressRef.current = true;
    setLoading(true);
    setPaymentAttempts(0);

    Swal.fire({
      title: "Initiating M-Pesa Payment...",
      html: `
        <p>Sending STK Push to <strong>${phone}</strong></p>
        <p class="text-sm">Enter your M-Pesa PIN when prompted.</p>
      `,
      icon: "info",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Vercel endpoint: /api/stk-push
      const response = await fetch("/api/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone,
          amount,
          customer_name:
            formData.name || formData.customer_name || "Customer",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true || !data.reference) {
        throw new Error(
          data.message || "PayHero did not accept the STK Push request."
        );
      }

      // This is PayHero's transaction reference, NOT CheckoutRequestID.
      const reference = data.reference;

      sessionStorage.setItem("payment_status", "pending");
      sessionStorage.setItem("payment_reference", reference);

      console.log("PayHero STK Push accepted:", {
        status: data.status,
        reference,
        checkout_request_id: data.checkout_request_id,
      });

      Swal.fire({
        title: "Check Your Phone",
        html: `
          <p>STK Push sent to <strong>${phone}</strong></p>
          <p class="text-sm">Enter your M-Pesa PIN to complete payment.</p>
          <p class="text-xs mt-2">We will check the transaction status automatically.</p>
        `,
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      paymentInProgressRef.current = false;
      await checkPaymentStatus(reference, 0);
    } catch (error) {
      console.error("PayHero STK Push error:", error);

      paymentInProgressRef.current = false;
      setLoading(false);
      Swal.close();

      let errorMessage =
        error.message || "Failed to initiate M-Pesa payment. Please try again.";

      await Swal.fire({
        title: "Payment Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#0ea5e9",
        allowOutsideClick: false,
      });
    }
  };

  if (!formData || !loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 flex items-center space-x-2 text-sky-600 hover:text-sky-800 z-50 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      {/* Stepper */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Stepper steps={steps} currentStep={2} />
      </div>

      {/* Payment Card */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Activate Your Loan
            </h1>
            <p className="text-gray-600 mt-2">
              Pay the one-time processing fee to release your funds
            </p>
          </div>

          {/* Loan Summary */}
          <div className="space-y-4 mb-8">
            <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-100">
              <p className="text-sm text-sky-600 mb-1">Loan Amount</p>
              <p className="text-3xl font-bold text-sky-800">
                KES {loanData.loan_amount?.toLocaleString() || "0"}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-sky-100 rounded-full text-xs text-sky-700">
                ✔ Pre-approved
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
              <p className="text-sm text-emerald-600 mb-1">Processing Fee</p>
              <p className="text-2xl font-bold text-emerald-800">
                KES {loanData.processing_fee?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-emerald-800 mt-1">One-time fee</p>
            </div>

            <div className="bg-white rounded-xl p-4 flex items-center space-x-3 border border-gray-100 shadow-sm">
              <div className="p-2 bg-sky-50 rounded-full">
                <Phone size={18} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">M-Pesa Number</p>
                <p className="font-medium text-gray-800">
                  {formData.phone_number}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-sky-50/50 rounded-lg p-4 mb-8 border border-sky-100 flex items-start space-x-3">
            <ShieldCheck
              size={20}
              className="text-sky-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Secure Payment:</strong> We use M-Pesa STK Push for your
                security. You will receive a prompt on your phone to enter your
                PIN. No charges until you confirm.
              </p>
            </div>
          </div>

          {/* Pay Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign size={20} />
                <span>
                  Pay KES {loanData.processing_fee?.toLocaleString() || "0"} via
                  M-Pesa
                </span>
              </>
            )}
          </motion.button>

          {/* Payment Attempts Counter */}
          {paymentAttempts > 0 && (
            <div className="mt-4 text-center text-xs text-gray-500">
              <Clock size={14} className="inline-block mr-1" />
              Checking payment status... ({paymentAttempts}/{MAX_ATTEMPTS})
            </div>
          )}

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            🔒 Your payment is secured by M-Pesa. No charges until you enter
            your PIN.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
