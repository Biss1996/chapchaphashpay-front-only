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
  User,
  BadgeCheck,
  Receipt,
} from "lucide-react";

export default function Success() {
  const navigate = useNavigate();

  const alertShown = useRef(false);

  const [showConfetti, setShowConfetti] =
    useState(true);

  // SAFE STORAGE FETCH
  const loanData = JSON.parse(
    sessionStorage.getItem("myLoan") || "{}"
  );

  const userData = JSON.parse(
    sessionStorage.getItem("userData") || "{}"
  );

  const paymentStatus =
    sessionStorage.getItem("payment_status");

  const paymentReference =
    sessionStorage.getItem(
      "payment_reference"
    ) || `MKP-${Date.now()}`;

  // VALIDATE ACCESS
  useEffect(() => {
    if (
      paymentStatus !== "completed" ||
      !loanData.loan_amount
    ) {
      Swal.fire({
        title: "Unauthorized Access",
        text: "Complete payment first.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/");
      });

      return;
    }

    // SHOW ALERT ONLY ONCE
    if (alertShown.current) return;

    alertShown.current = true;

    // STOP CONFETTI
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // SUCCESS POPUP
    Swal.fire({
      title: "Payment Successful 🎉",
      html: `
        <div style="text-align:center">
          <div style="font-size:60px;margin-bottom:10px;">
            ✅
          </div>

          <p style="font-size:16px;">
            Your activation fee has been received successfully.
          </p>

          <div style="
            background:#ecfdf5;
            padding:16px;
            border-radius:12px;
            margin-top:16px;
          ">
            <p style="margin:0;color:#065f46;">
              Loan Amount:
              <strong>
                KES ${(
                  loanData.loan_amount || 0
                ).toLocaleString()}
              </strong>
            </p>
          </div>

          <p style="
            margin-top:18px;
            font-size:14px;
            color:#6b7280;
          ">
            Your loan is now under processing.
          </p>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText:
        "Continue to Dashboard",
      allowOutsideClick: false,
    }).then(() => {
      navigate("/dashboard");
    });
  }, [navigate, loanData, paymentStatus]);

  // CALCULATIONS
  const loanAmount = Number(
    loanData.loan_amount || 0
  );

  const processingFee = Number(
    loanData.processing_fee || 0
  );

  const interestRate = Number(
    loanData.interest_rate || 10
  );

  const interest =
    (loanAmount * interestRate) / 100;

  const totalRepayment =
    loanAmount + processingFee + interest;

  const monthlyInstallment =
    totalRepayment / 4;

  const userName =
    userData.name ||
    userData.customer_name ||
    "Customer";

  // ANIMATIONS
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
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        min-h-screen
        bg-gradient-to-br
        from-emerald-50
        via-white
        to-sky-50
        flex
        items-center
        justify-center
        px-4
        py-10
        overflow-hidden
        relative
      "
    >
      {/* CONFETTI */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: -100,
                x:
                  Math.random() * window.innerWidth,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: window.innerHeight + 100,
                rotate: 360,
              }}
              transition={{
                duration:
                  3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="
                absolute
                w-3
                h-3
                rounded-full
              "
              style={{
                backgroundColor: `hsl(${
                  Math.random() * 360
                },70%,50%)`,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="
          relative
          z-10
          w-full
          max-w-lg
          bg-white
          rounded-3xl
          shadow-2xl
          border
          border-gray-100
          p-6
          md:p-8
        "
      >
        {/* SUCCESS ICON */}
        <motion.div
          variants={item}
          className="flex justify-center"
        >
          <div
            className="
              w-24
              h-24
              rounded-full
              bg-gradient-to-br
              from-emerald-100
              to-sky-100
              flex
              items-center
              justify-center
              shadow-lg
            "
          >
            <CheckCircle
              size={52}
              className="text-emerald-600"
            />
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.div
          variants={item}
          className="text-center mt-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Payment Confirmed 🎉
          </h1>

          <p className="text-gray-600 mt-2">
            Thank you, {userName}.
          </p>
        </motion.div>

        {/* STATUS CARD */}
        <motion.div
          variants={item}
          className="
            mt-8
            bg-emerald-50
            border
            border-emerald-100
            rounded-2xl
            p-5
          "
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Status
            </span>

            <span
              className="
                flex
                items-center
                gap-1
                text-emerald-700
                font-semibold
              "
            >
              <BadgeCheck size={18} />
              Approved
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Loan Amount
              </span>

              <span className="font-bold text-emerald-700">
                KES{" "}
                {loanAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Processing Fee
              </span>

              <span className="font-semibold text-sky-700">
                KES{" "}
                {processingFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Interest ({interestRate}%)
              </span>

              <span className="font-semibold text-purple-700">
                KES{" "}
                {interest.toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="font-bold text-gray-800">
                Total Repayment
              </span>

              <span className="font-bold text-emerald-700">
                KES{" "}
                {Math.round(
                  totalRepayment
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* PAYMENT DETAILS */}
        <motion.div
          variants={item}
          className="
            mt-6
            bg-sky-50
            rounded-2xl
            p-5
            border
            border-sky-100
          "
        >
          <h3 className="font-bold text-sky-800 mb-4 flex items-center gap-2">
            <Receipt size={18} />
            Payment Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Reference
              </span>

              <span className="font-medium">
                {paymentReference}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Phone
              </span>

              <span className="font-medium">
                {userData.phone_number ||
                  "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Monthly Installment
              </span>

              <span className="font-medium">
                KES{" "}
                {Math.round(
                  monthlyInstallment
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* NEXT STEPS */}
        <motion.div
          variants={item}
          className="
            mt-6
            bg-white
            border
            border-gray-100
            rounded-2xl
            p-5
          "
        >
          <h3 className="font-bold text-gray-800 mb-4">
            Next Steps
          </h3>

          <div className="space-y-4">
            {[
              "Your application is being reviewed.",
              "Funds may reflect within 3 business days.",
              "Keep your phone active for updates.",
              "You will receive SMS confirmation shortly.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
              >
                <div
                  className="
                    w-6
                    h-6
                    rounded-full
                    bg-emerald-100
                    text-emerald-600
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                  "
                >
                  {i + 1}
                </div>

                <p className="text-sm text-gray-700">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          variants={item}
          className="mt-8 space-y-4"
        >
          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              w-full
              py-4
              rounded-xl
              bg-gradient-to-r
              from-emerald-600
              to-sky-600
              text-white
              font-bold
              flex
              items-center
              justify-center
              gap-2
              hover:scale-[1.01]
              transition
            "
          >
            <span>Go to Dashboard</span>

            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="
              w-full
              py-4
              rounded-xl
              border-2
              border-gray-200
              font-semibold
              text-gray-700
              flex
              items-center
              justify-center
              gap-2
              hover:bg-gray-50
              transition
            "
          >
            <Home size={20} />

            <span>Return Home</span>
          </button>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          variants={item}
          className="
            mt-8
            text-center
            text-xs
            text-gray-500
          "
        >
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck
              size={14}
              className="text-emerald-500"
            />

            <span>
              Secure • Fast • Reliable
            </span>
          </div>

          <p className="mt-2">
            © {new Date().getFullYear()} Mkopo
            Chapchap
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}