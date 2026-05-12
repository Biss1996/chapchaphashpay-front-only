import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ChevronLeft, DollarSign, Phone, User, Loader2, ShieldCheck, Clock } from "lucide-react";
import Loader from "../components/Loader";
import Stepper from "../components/Stepper";
import { initiateSTKPush, checkTransactionStatus } from "../services/api";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const maxAttempts = 40; // ~2 minutes (3s interval)

  // Steps for the stepper
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

      // Merge loan and user data
      setFormData({ ...user, ...loan });
      setLoanData(loan);
    } catch (err) {
      console.error("Storage error:", err);
      toast.error("Failed to load loan data. Please try again.");
      navigate("/apply");
    }
  }, [navigate]);

  // Poll payment status with proper cleanup
  const checkPaymentStatus = (checkoutId) => {
    let attempts = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      attempts++;
      setPaymentAttempts(attempts);

      try {
        const status = await checkTransactionStatus(checkoutId);
        console.log("Payment status response:", status);

        // Handle PayHero's response format
        const resultCode = String(status?.ResultCode ?? status?.result_code ?? "");
        const responseCode = String(status?.ResponseCode ?? status?.response_code ?? "");
        const resultDesc = status?.ResultDesc ?? status?.result_desc ?? "";

        // SUCCESS: PayHero returns ResultCode="0" for successful payments
        if (resultCode === "0" || responseCode === "0") {
          clearInterval(intervalRef.current);
          setLoading(false);

          // Store payment confirmation
          sessionStorage.setItem("payment_status", "completed");
          sessionStorage.setItem("payment_reference", checkoutId);
          sessionStorage.setItem("payment_time", new Date().toISOString());

          // Close any open Swal
          Swal.close();

          // Redirect to success page
          navigate("/success", { replace: true });
          return;
        }

        // PENDING: No response yet
        if (!resultCode || resultCode === "null" || !responseCode || responseCode === "null") {
          console.log(`Payment pending... (Attempt ${attempts}/${maxAttempts})`);
          return;
        }

        // FAILURE: PayHero error codes
        if (resultCode === "1032" || resultCode === "1" || resultCode === "2001" || responseCode === "1") {
          clearInterval(intervalRef.current);
          setLoading(false);
          Swal.close();

          await Swal.fire({
            title: "Payment Failed ❌",
            text: resultDesc || "Payment was cancelled or failed. Please try again.",
            icon: "error",
            confirmButtonColor: "#0ea5e9", // Changed to match theme
            allowOutsideClick: false,
          });

          navigate("/apply");
          return;
        }

        // MAX ATTEMPTS REACHED
        if (attempts >= maxAttempts) {
          clearInterval(intervalRef.current);
          setLoading(false);
          Swal.close();

          await Swal.fire({
            title: "Payment Timeout ⏳",
            text: `We couldn't confirm your payment after ${maxAttempts * 3} seconds. Please check your M-Pesa statement.`,
            icon: "warning",
            confirmButtonColor: "#f59e0b",
            allowOutsideClick: false,
          });

          navigate("/apply");
        }
      } catch (err) {
        console.error("Status check error:", err);
        if (attempts >= maxAttempts) {
          clearInterval(intervalRef.current);
          setLoading(false);
          Swal.close();

          await Swal.fire({
            title: "Connection Error",
            text: "Failed to verify payment status. Please check your internet connection.",
            icon: "error",
            confirmButtonColor: "#ef4444",
            allowOutsideClick: false,
          });
          navigate("/apply");
        }
      }
    }, 3000); // Check every 3 seconds
  };

  const handlePay = async () => {
    if (!loanData || !formData) {
      toast.error("Missing loan or user data. Please start over.");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      await Swal.fire({
        title: "Invalid Phone Number",
        text: "Please use a valid Kenyan phone number (e.g., 0712345678 or +254712345678)",
        icon: "error",
        confirmButtonColor: "#0ea5e9", // Changed to match theme
      });
      return;
    }

    setLoading(true);

    // Show initial loading prompt
    Swal.fire({
      title: "Initiating M-Pesa Payment...",
      html: `
        <p>Sending STK Push to <strong>${formData.phone_number}</strong></p>
        <p class="text-sm">Enter your M-Pesa PIN when prompted.</p>
      `,
      icon: "info",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Format phone number for PayHero
      const formattedPhone = formData.phone_number.startsWith('+254')
        ? formData.phone_number
        : formData.phone_number.startsWith('0')
          ? `+254${formData.phone_number.slice(1)}`
          : `+254${formData.phone_number}`;

      // Initiate STK Push
      const response = await initiateSTKPush(
        formattedPhone,
        loanData.processing_fee,
        `LOAN-${Date.now()}-${formData.phone_number.slice(-4)}`
      );

      console.log("STK Push Response:", response);

      // Extract CheckoutRequestID (PayHero's standard format)
      const checkoutId = response.CheckoutRequestID ||
                        response.checkoutRequestID ||
                        response.checkout_id ||
                        response.CheckoutID;

      if (!checkoutId) {
        throw new Error("No CheckoutRequestID received from PayHero. Please try again.");
      }

      // Update Swal to show phone check prompt
      await Swal.fire({
        title: "Check Your Phone 📱",
        html: `
          <p>STK Push sent to <strong>${formattedPhone}</strong></p>
          <p class="text-sm">Enter your M-Pesa PIN to complete payment.</p>
          <p class="text-xs mt-2">We'll confirm automatically once paid.</p>
        `,
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Start polling for payment status
      checkPaymentStatus(checkoutId);

    } catch (error) {
      console.error("STK Push Error:", error);
      setLoading(false);
      Swal.close();

      // Handle specific error cases
      let errorMessage = "Failed to initiate M-Pesa payment. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error_message ||
                        error.response.data?.message ||
                        "Invalid request. Please check your details.";
        } else if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please contact support.";
        } else if (error.response.status === 404) {
          errorMessage = "Payment service unavailable. Please try again later.";
        } else if (error.response.data?.error_message) {
          errorMessage = error.response.data.error_message;
        }
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      await Swal.fire({
        title: "Payment Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#0ea5e9", // Changed to match theme
        allowOutsideClick: false,
      });
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
                <p className="font-medium text-gray-800">{formData.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-sky-50/50 rounded-lg p-4 mb-8 border border-sky-100 flex items-start space-x-3">
            <ShieldCheck size={20} className="text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Secure Payment:</strong> We use M-Pesa STK Push for your security.
                You'll receive a prompt on your phone to enter your PIN.
                No charges until you confirm.
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
              
                <span>Pay KES {loanData.processing_fee?.toLocaleString() || "0"} via M-Pesa</span>
              </>
            )}
          </motion.button>

          {/* Payment Attempts Counter */}
          {paymentAttempts > 0 && (
            <div className="mt-4 text-center text-xs text-gray-500">
              <Clock size={14} className="inline-block mr-1" />
              Checking payment status... ({paymentAttempts}/{maxAttempts})
            </div>
          )}

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            🔒 Your payment is secured by M-Pesa. No charges until you enter your PIN.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}