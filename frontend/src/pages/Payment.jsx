import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Phone,
  Loader2,
  ShieldCheck,
  Clock
} from "lucide-react";

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
  const isNavigatingRef = useRef(false);

  const maxAttempts = 40;
  const steps = ["Select Amount", "Check Eligibility", "Pay Fee", "Success"];

  // Load session data
  useEffect(() => {
    try {
      const loan = JSON.parse(sessionStorage.getItem("myLoan") || "null");
      const user = JSON.parse(sessionStorage.getItem("userData") || "null");

      if (!loan) {
        toast.error("No loan data found. Please start over.");
        navigate("/apply");
        return;
      }

      setFormData({ ...user, ...loan });
      setLoanData(loan);
    } catch (err) {
      toast.error("Failed to load data");
      navigate("/apply");
    }
  }, [navigate]);

  // SAFE NAVIGATION
  const safeNavigate = (path) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    navigate(path, { replace: true });
  };

  // PAYMENT POLLING (FIXED)
  const checkPaymentStatus = (checkoutId) => {
    let attempts = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      attempts++;
      setPaymentAttempts(attempts);

      try {
        const status = await checkTransactionStatus(checkoutId);

        const resultCode = String(status?.ResultCode ?? "");
        const responseCode = String(status?.ResponseCode ?? "");
        const resultDesc = (status?.ResultDesc ?? "").toLowerCase();

        // ======================
        // ✅ STRICT SUCCESS RULE
        // ======================
        const isSuccess =
          resultCode === "0" &&
          (resultDesc.includes("success") ||
            resultDesc.includes("completed") ||
            responseCode === "0");

        if (isSuccess) {
          clearInterval(intervalRef.current);
          setLoading(false);

          sessionStorage.setItem("payment_status", "completed");
          sessionStorage.setItem("payment_reference", checkoutId);
          sessionStorage.setItem("payment_time", new Date().toISOString());

          Swal.close();

          setTimeout(() => {
            safeNavigate("/success");
          }, 800);

          return;
        }

        // ======================
        // ⏳ PENDING
        // ======================
        if (!resultCode || resultCode === "null") {
          console.log(`Payment pending... (${attempts}/${maxAttempts})`);
          return;
        }

        // ======================
        // ❌ FAILED
        // ======================
        const isFailed =
          resultCode === "1032" ||
          resultCode === "1" ||
          resultCode === "2001" ||
          responseCode === "1";

        if (isFailed) {
          clearInterval(intervalRef.current);
          setLoading(false);

          Swal.close();

          await Swal.fire({
            title: "Payment Failed ❌",
            text: status?.ResultDesc || "Payment failed or cancelled",
            icon: "error",
            confirmButtonColor: "#0ea5e9",
          });

          safeNavigate("/apply");
          return;
        }

        // ======================
        // ⛔ TIMEOUT
        // ======================
        if (attempts >= maxAttempts) {
          clearInterval(intervalRef.current);
          setLoading(false);

          Swal.close();

          await Swal.fire({
            title: "Payment Timeout ⏳",
            text: "We couldn't confirm your payment. Check M-Pesa statement.",
            icon: "warning",
            confirmButtonColor: "#f59e0b",
          });

          safeNavigate("/apply");
        }
      } catch (err) {
        console.error(err);

        if (attempts >= maxAttempts) {
          clearInterval(intervalRef.current);
          setLoading(false);

          Swal.close();

          await Swal.fire({
            title: "Network Error",
            text: "Could not verify payment status.",
            icon: "error",
          });

          safeNavigate("/apply");
        }
      }
    }, 3000);
  };

  // ======================
  // INITIATE PAYMENT
  // ======================
  const handlePay = async () => {
    if (!formData || !loanData) return;

    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      return Swal.fire("Invalid Phone", "Use valid Kenyan number", "error");
    }

    setLoading(true);

    Swal.fire({
      title: "Sending STK Push...",
      html: "Check your phone and enter M-Pesa PIN",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formattedPhone = formData.phone_number.startsWith("+254")
        ? formData.phone_number
        : `+254${formData.phone_number.slice(1)}`;

      const response = await initiateSTKPush(
        formattedPhone,
        loanData.processing_fee,
        `LOAN-${Date.now()}`
      );

      const checkoutId =
        response.CheckoutRequestID ||
        response.checkoutRequestID ||
        response.checkout_id;

      if (!checkoutId) throw new Error("Missing Checkout ID");

      Swal.fire({
        title: "Check Your Phone 📱",
        text: "Enter M-Pesa PIN to complete payment",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // IMPORTANT: start polling ONLY (no redirect here)
      checkPaymentStatus(checkoutId);
    } catch (error) {
      setLoading(false);
      Swal.close();

      Swal.fire("Error", "Failed to initiate payment", "error");
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!formData || !loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center">
        <ChevronLeft /> Back
      </button>

      <Stepper steps={steps} currentStep={2} />

      {/* Card */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">Pay Loan Fee</h1>

        <div className="mb-4 flex items-center gap-3">
          <Phone />
          <span>{formData.phone_number}</span>
        </div>

        <div className="mb-6 text-center">
          <p className="text-gray-500">Processing Fee</p>
          <h2 className="text-2xl font-bold">
            KES {loanData.processing_fee?.toLocaleString()}
          </h2>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Pay with M-Pesa"
          )}
        </button>

        {paymentAttempts > 0 && (
          <p className="text-xs text-center mt-3 text-gray-500">
            Checking payment... {paymentAttempts}/{maxAttempts}
          </p>
        )}

        <div className="mt-4 flex items-center text-xs text-gray-500">
          <ShieldCheck className="mr-2" />
          Secure M-Pesa STK Push
        </div>
      </div>
    </motion.div>
  );
}