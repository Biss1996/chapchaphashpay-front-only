import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ChevronLeft, DollarSign, Phone, User, Loader2, ShieldCheck } from "lucide-react";
import Loader from "../components/Loader";
import Stepper from "../components/Stepper";
import { initiateSTKPush, checkTransactionStatus } from "../services/api";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const navigate = useNavigate();

  // Steps for the stepper
  const steps = ["Select Amount", "Check Eligibility", "Pay Fee", "Success"];

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("myLoan") || "null");
      const loan = JSON.parse(sessionStorage.getItem("myLoan") || "null");

      if (!loan) {
        toast.error("No loan data found. Please start over.");
        navigate("/apply");
        return;
      }

      setFormData(data);
      setLoanData(loan);
    } catch (err) {
      console.error("Storage error:", err);
      toast.error("Failed to load loan data. Please try again.");
      navigate("/apply");
    }
  }, [navigate]);

  // Poll payment status
  const checkPaymentStatus = (checkoutId) => {
    let attempts = 0;
    const maxAttempts = 40; // ~2 minutes (3s interval)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const status = await checkTransactionStatus(checkoutId);
        console.log("Payment status:", status);

        const resultCode = String(status.ResultCode ?? "");
        const responseCode = String(status.ResponseCode ?? "");

        // Success cases
        if (resultCode === "0" || responseCode === "0") {
          clearInterval(interval);
          setLoading(false);

          sessionStorage.setItem("payment_status", "completed");

          await Swal.fire({
            title: "Payment Confirmed ✅",
            text: "Your payment was successful. Your loan is being processed.",
            icon: "success",
            confirmButtonColor: "#10b981",
            allowOutsideClick: false,
          });

          navigate("/success", { replace: true });
          return;
        }

        // Pending cases
        if (
          resultCode === "" ||
          resultCode === "null" ||
          responseCode === "" ||
          responseCode === "null"
        ) {
          console.log(`Payment pending... (Attempt ${attempts}/${maxAttempts})`);
          return;
        }

        // Failure cases
        if (resultCode === "1032" || resultCode === "1" || resultCode === "2001" || responseCode === "1") {
          clearInterval(interval);
          setLoading(false);

          await Swal.fire({
            title: "Payment Failed ❌",
            text: status.ResultDesc || "Payment was cancelled or failed. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });

          return;
        }

        // Max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);

          await Swal.fire({
            title: "Payment Timeout ⏳",
            text: "We couldn't confirm your payment. Please check your M-Pesa statement or contact support.",
            icon: "warning",
            confirmButtonColor: "#f59e0b",
          });

          navigate("/apply");
        }
      } catch (err) {
        console.error("Status check error:", err);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          toast.error("Failed to verify payment. Please contact support.");
        }
      }
    }, 3000); // Check every 3 seconds
  };

  const handlePay = async () => {
    if (!loanData || !formData) {
      toast.error("Missing loan or user data. Please start over.");
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
      // Initiate STK Push
      const response = await initiateSTKPush(
        formData.phone_number,
        loanData.processing_fee,
        `LOAN-${Date.now()}`
      );

      console.log("STK Push Response:", response);

      // Extract checkout ID (handle various possible response formats)
      const checkoutId =
        response.checkout_id ||
        response.checkoutId ||
        response.CheckoutRequestID ||
        response.CheckoutID ||
        response.checkoutid ||
        response?.raw?.checkout_id ||
        response?.raw?.checkoutId ||
        response?.raw?.CheckoutRequestID ||
        response?.raw?.CheckoutID;

      if (!checkoutId) {
        throw new Error("No checkout ID received from payment gateway.");
      }

      // Update Swal to show phone check prompt
      await Swal.fire({
        title: "Check Your Phone 📱",
        html: `
          <p>STK Push sent to <strong>${formData.phone_number}</strong></p>
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

      // Close any open Swal
      Swal.close();

      // Show error
      await Swal.fire({
        title: "Payment Error",
        text: error.message || "Failed to initiate M-Pesa payment. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });

      toast.error("Payment failed. Please try again.");
    }
  };

  if (!formData || !loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 flex items-center space-x-2 text-white/80 hover:text-white z-50"
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
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="max-w-lg mx-auto glass-card rounded-2xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Activate Your Loan
            </h1>
            <p className="text-white/70 mt-2">
              Pay the one-time processing fee to release your funds
            </p>
          </div>

          {/* Loan Summary */}
          <div className="space-y-4 mb-8">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-white/60 mb-1">Loan Amount</p>
              <p className="text-3xl font-bold text-white">
                KES {loanData.loan_amount?.toLocaleString() || "0"}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                ✔ Pre-approved
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-white/60 mb-1">Processing Fee</p>
              <p className="text-2xl font-bold text-white">
                KES {loanData.processing_fee?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-white/50 mt-1">One-time fee</p>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">M-Pesa Number</p>
                <p className="font-medium text-white">{formData.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-white/5 rounded-lg p-4 mb-8 flex items-start space-x-3">
            <ShieldCheck size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/80">
                <strong>Secure Payment:</strong> We use M-Pesa STK Push for your security. You'll receive a prompt on your phone to enter your PIN.
              </p>
            </div>
          </div>

          {/* Pay Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign size={20} />
                <span>Pay KES {loanData.processing_fee?.toLocaleString() || "0"} via M-Pesa</span>
              </>
            )}
          </motion.button>

          {/* Footer Note */}
          <p className="text-center text-xs text-white/50 mt-6">
            🔒 Your payment is secured by M-Pesa. No charges until you enter your PIN.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}