
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  CheckCircle,
  ShieldCheck,
  Home,
  ArrowRight,
  BadgeCheck,
  Receipt,
  RefreshCw,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

// Safely read and parse session storage
const readStorage = (key, fallback = {}) => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE")}`;

export default function Success() {
  const navigate = useNavigate();

  const [loanData] = useState(() => readStorage("myLoan"));
  const [userData] = useState(() => readStorage("userData"));

  const [paymentReference] = useState(
    () => sessionStorage.getItem("payment_reference") || ""
  );

  const [verification, setVerification] = useState("checking");
  const [verificationMessage, setVerificationMessage] = useState(
    "Confirming your payment with PayHero..."
  );
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  const loanAmount = Number(loanData?.loan_amount || 0);
  const processingFee = Number(loanData?.processing_fee || 0);
  const interestRate = Number(loanData?.interest_rate ?? 10);

  const interest = (loanAmount * interestRate) / 100;
  const totalRepayment = loanAmount + processingFee + interest;
  const monthlyInstallment = totalRepayment / 4;

  const userName =
    userData?.name ||
    userData?.customer_name ||
    "Customer";

  const phoneNumber =
    userData?.phone_number ||
    userData?.phone ||
    "N/A";

  // Generate confetti positions once instead of on every render
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        duration: 3 + Math.random() * 3,
        delay: Math.random() * 2,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      })),
    []
  );

  // Independently verify payment with PayHero
  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      if (!paymentReference) {
        setVerification("failed");
        setVerificationMessage(
          "We could not find your payment reference. Please contact support before making another payment."
        );
        return;
      }

      if (!loanAmount || loanAmount <= 0) {
        setVerification("failed");
        setVerificationMessage(
          "Your loan application details could not be found. Please contact support."
        );
        return;
      }

      setVerification("checking");
      setVerificationMessage(
        "Confirming your payment with PayHero..."
      );

      const maxAttempts = 40;
      const interval = 3000;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!active) return;

        try {
          const response = await fetch(
            `/api/status?reference=${encodeURIComponent(
              paymentReference
            )}`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Payment status request failed");
          }

          const data = await response.json();

          if (!active) return;

          const status = String(data.status || "").toUpperCase();

          if (status === "SUCCESS" && data.success === true) {
            setVerification("verified");
            setVerificationMessage(
              "Your payment has been successfully confirmed by PayHero."
            );

            sessionStorage.setItem(
              "payment_status",
              "completed"
            );

            sessionStorage.setItem(
              "payment_verified_at",
              new Date().toISOString()
            );

            return;
          }

          if (status === "FAILED") {
            setVerification("failed");
            setVerificationMessage(
              "PayHero has reported that this payment was unsuccessful. Please contact support if money was deducted from your M-Pesa account."
            );

            sessionStorage.setItem(
              "payment_status",
              "failed"
            );

            return;
          }

          // QUEUED or another non-final status
          setVerificationMessage(
            "Your payment is still being processed. Please wait while we confirm the transaction."
          );
        } catch (error) {
          console.error("Payment verification error:", error);

          if (active) {
            setVerificationMessage(
              "We are having trouble checking your payment. Retrying automatically..."
            );
          }
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, interval)
          );
        }
      }

      if (!active) return;

      setVerification("pending");
      setVerificationMessage(
        "We have not received a final payment confirmation yet. Your transaction may still be processing. Please check again before taking any further action."
      );
    };

    verifyPayment();

    return () => {
      active = false;
    };
  }, [paymentReference, loanAmount, retryCount]);

  // Stop confetti after five seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const isVerified = verification === "verified";
  const isChecking = verification === "checking";
  const isFailed = verification === "failed";
  const isPending = verification === "pending";

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
      {showConfetti && isVerified && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 0,
                y: -100,
                x: `${piece.x}vw`,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: "110vh",
                rotate: 360,
              }}
              transition={{
                duration: piece.duration,
                repeat: Infinity,
                delay: piece.delay,
              }}
              className="
                absolute
                w-3
                h-3
                rounded-full
              "
              style={{
                backgroundColor: piece.color,
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
        {/* PAYMENT STATUS ICON */}
        <motion.div
          variants={item}
          className="flex justify-center"
        >
          <div
            className={`
              w-24
              h-24
              rounded-full
              flex
              items-center
              justify-center
              shadow-lg
              ${
                isVerified
                  ? "bg-gradient-to-br from-emerald-100 to-sky-100"
                  : isFailed
                  ? "bg-red-100"
                  : "bg-amber-100"
              }
            `}
          >
            {isChecking || isPending ? (
              <Loader2
                size={52}
                className="text-amber-600 animate-spin"
              />
            ) : isFailed ? (
              <AlertCircle
                size={52}
                className="text-red-600"
              />
            ) : (
              <CheckCircle
                size={52}
                className="text-emerald-600"
              />
            )}
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.div
          variants={item}
          className="text-center mt-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            {isChecking
              ? "Verifying Payment"
              : isPending
              ? "Payment Processing"
              : isFailed
              ? "Payment Not Confirmed"
              : "Payment Confirmed 🎉"}
          </h1>

          <p className="text-gray-600 mt-2">
            {isVerified
              ? `Thank you, ${userName}.`
              : isFailed
              ? "Your payment has not been verified."
              : "Please wait while we check your transaction."}
          </p>
        </motion.div>

        {/* VERIFICATION STATUS */}
        <motion.div
          variants={item}
          className={`
            mt-8
            rounded-2xl
            border
            p-5
            ${
              isVerified
                ? "bg-emerald-50 border-emerald-100"
                : isFailed
                ? "bg-red-50 border-red-100"
                : "bg-amber-50 border-amber-100"
            }
          `}
        >
          <div className="flex items-center gap-2 font-semibold">
            {isVerified ? (
              <BadgeCheck
                size={20}
                className="text-emerald-700"
              />
            ) : isFailed ? (
              <AlertCircle
                size={20}
                className="text-red-700"
              />
            ) : (
              <Clock
                size={20}
                className="text-amber-700"
              />
            )}

            <span
              className={
                isVerified
                  ? "text-emerald-800"
                  : isFailed
                  ? "text-red-800"
                  : "text-amber-800"
              }
            >
              {isVerified
                ? "Payment Verified"
                : isFailed
                ? "Verification Failed"
                : "Awaiting Confirmation"}
            </span>
          </div>

          <p className="text-sm text-gray-700 mt-3">
            {verificationMessage}
          </p>

          {(isPending || isFailed) && (
            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="
                mt-4
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gray-900
                px-5
                py-3
                text-white
                font-semibold
                w-full
                hover:bg-gray-700
                transition
              "
            >
              <RefreshCw size={17} />
              Check Payment Again
            </button>
          )}
        </motion.div>

        {/* LOAN DETAILS - ONLY AFTER VERIFIED PAYMENT */}
        {isVerified && (
          <>
            <motion.div
              variants={item}
              className="
                mt-6
                bg-emerald-50
                border
                border-emerald-100
                rounded-2xl
                p-5
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Payment Status
                </span>

                <span className="
                  flex
                  items-center
                  gap-1
                  text-emerald-700
                  font-semibold
                ">
                  <BadgeCheck size={18} />
                  Verified
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Loan Amount
                  </span>

                  <span className="font-bold text-emerald-700">
                    {formatKES(loanAmount)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Processing Fee
                  </span>

                  <span className="font-semibold text-sky-700">
                    {formatKES(processingFee)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Interest ({interestRate}%)
                  </span>

                  <span className="font-semibold text-purple-700">
                    {formatKES(interest)}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between gap-3">
                  <span className="font-bold text-gray-800">
                    Total Repayment
                  </span>

                  <span className="font-bold text-emerald-700">
                    {formatKES(Math.round(totalRepayment))}
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
              <h3 className="
                font-bold
                text-sky-800
                mb-4
                flex
                items-center
                gap-2
              ">
                <Receipt size={18} />
                Payment Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Reference
                  </span>

                  <span className="font-medium break-all text-right">
                    {paymentReference}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Phone
                  </span>

                  <span className="font-medium">
                    {phoneNumber}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Monthly Installment
                  </span>

                  <span className="font-medium">
                    {formatKES(Math.round(monthlyInstallment))}
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
                  "Your payment has been verified.",
                  "Your application will proceed for review.",
                  "Keep your phone active for updates.",
                  "Check your account for application updates.",
                ].map((text, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="
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
                      shrink-0
                    ">
                      {index + 1}
                    </div>

                    <p className="text-sm text-gray-700">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* ACTION BUTTONS */}
        <motion.div
          variants={item}
          className="mt-8 space-y-4"
        >
          {isVerified && (
            <button
              onClick={() => navigate("/dashboard")}
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
          )}

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
            © {new Date().getFullYear()} Mkopo Chapchap
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
