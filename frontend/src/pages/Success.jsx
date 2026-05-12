import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  CheckCircle,
  Clock,
  Phone,
  ShieldCheck,
  Zap,
  Home,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowRight,
  User
} from "lucide-react";

export default function Success() {
  const alertShown = useRef(false);
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  // Get data from sessionStorage with validation
  const loanData = JSON.parse(sessionStorage.getItem("myLoan") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const paymentStatus = sessionStorage.getItem("payment_status");

  useEffect(() => {
    // Security check: Redirect if user shouldn't be here
    if (paymentStatus !== "completed" || Object.keys(loanData).length === 0) {
      Swal.fire({
        title: "Access Denied",
        text: "You must complete payment to view this page.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        allowOutsideClick: false
      }).then(() => {
        navigate("/");
      });
      return;
    }

    if (alertShown.current) return;
    alertShown.current = true;

    // Trigger confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // Show success modal
    Swal.fire({
      title: "Payment Successful! 🎉",
      html: `
        <div style="text-align:center">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            Your activation fee has been received successfully.
          </p>
          <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
            <p style="margin: 0; color: #166534;">
              Your loan of <strong>KES ${(loanData.loan_amount || 0).toLocaleString()}</strong>
              is now being processed.
            </p>
          </div>
          <p style="margin: 1rem 0; font-size: 0.9rem;">
            You will receive confirmation within
            <span style="color: #10b981; font-weight: bold;"> 3 business days</span>.
          </p>
          <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem;">
            Please keep your phone active for updates.
          </p>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "View My Loan",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard");
      }
    });
  }, [navigate, loanData, paymentStatus]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const bounce = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Calculate repayment details with fallbacks
  const loanAmount = parseInt(loanData.loan_amount || 0);
  const processingFee = parseInt(loanData.processing_fee || 0);
  const interestRate = parseInt(loanData.interest_rate || 10);
  const totalRepayment = loanAmount + processingFee + Math.round(loanAmount * interestRate / 100);
  const monthlyInstallment = Math.round(totalRepayment / 4);

  // Format user name
  const userName = userData.name || userData.customer_name || "Valued Customer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 relative overflow-hidden"
    >
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -100, x: Math.random() * 100 - 50 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, 300, 500],
                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                rotate: [0, 360],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute w-4 h-4 rounded-full"
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center"
      >
        {/* Success Animation */}
        <motion.div
          variants={bounce}
          className="flex justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full flex items-center justify-center shadow-lg"
          >
            <CheckCircle size={48} className="text-emerald-600" />
          </motion.div>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          Payment Confirmed! 🎉
        </motion.h1>

        <motion.p
          variants={item}
          className="text-gray-600 mb-8"
        >
          Your activation fee has been received successfully, {userName}.
        </motion.p>

        {/* Loan Summary Card */}
        <motion.div
          variants={item}
          className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-6 mb-8 border border-emerald-100"
        >
          <h3 className="font-bold text-emerald-800 mb-4">Your Loan Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CreditCard size={18} className="text-emerald-600" />
                <span className="text-gray-600">Loan Amount</span>
              </div>
              <span className="font-bold text-emerald-700">
                KES {loanAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-sky-600" />
                <span className="text-gray-600">Processing Fee</span>
              </div>
              <span className="font-bold text-sky-700">
                KES {processingFee.toLocaleString()}
              </span>
            </div>

            {interestRate > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={18} className="text-purple-600" />
                  <span className="text-gray-600">Interest ({interestRate}%)</span>
                </div>
                <span className="font-bold text-purple-700">
                  KES {(loanAmount * interestRate / 100).toLocaleString()}
                </span>
              </div>
            )}

            <div className="border-t border-emerald-200 pt-4 mt-4">
              <div className="flex justify-between items-center font-bold">
                <div className="flex items-center space-x-2">
                  <Zap size={18} className="text-emerald-600" />
                  <span className="text-emerald-800">Total Repayment</span>
                </div>
                <span className="text-emerald-700 text-lg">
                  KES {totalRepayment.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Monthly installment: KES {monthlyInstallment.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          variants={item}
          className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100"
        >
          <h3 className="font-bold text-blue-800 mb-4 flex items-center justify-center space-x-2">
            <Clock size={20} />
            <span>What Happens Next?</span>
          </h3>

          <div className="space-y-4 text-left">
            {[
              {
                icon: <Phone size={18} className="text-blue-600" />,
                text: "Keep your phone active for M-Pesa updates",
              },
              {
                icon: <ShieldCheck size={18} className="text-blue-600" />,
                text: "Your application is being securely reviewed",
              },
              {
                icon: <User size={18} className="text-blue-600" />,
                text: `We'll notify ${userName.split(' ')[0] || 'you'} via SMS`,
              },
              {
                icon: <Calendar size={18} className="text-blue-600" />,
                text: "You'll receive confirmation within 3 business days",
              },
            ].map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
                <p className="text-sm text-gray-700">{step.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={item}
          className="space-y-4"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
          >
            <span>View My Loan</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Return Home</span>
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          variants={item}
          className="text-xs text-gray-500 mt-8 flex items-center justify-center space-x-4"
        >
          <span className="flex items-center space-x-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure • Fast • Reliable</span>
          </span>
          <span>© {new Date().getFullYear()} Mkopo Chapchap</span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}