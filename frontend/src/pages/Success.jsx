
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  CheckCircle,
  Clock,
  ShieldCheck,
  Home,
  ArrowRight,
  BadgeCheck,
  Receipt,
  Calendar,
  Wallet,
  AlertCircle,
} from "lucide-react";

const DISBURSEMENT_DAYS = 4;
const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40;

const readStorage = (key, fallback = {}) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

export default function Success() {
  const navigate = useNavigate();

  const [loanData] = useState(() => readStorage("myLoan"));
  const [userData] = useState(() => readStorage("userData"));
  const [paymentReference] = useState(
    () => sessionStorage.getItem("payment_reference") || ""
  );

  const [verification, setVerification] = useState("checking");
  const [paymentDate, setPaymentDate] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");

  // Independently verify the PayHero transaction before displaying approval.
  useEffect(() => {
    let cancelled = false;
    let timeout;

    if (!paymentReference || !loanData?.loan_amount) {
      setVerification("invalid");
      return;
    }

    const verifyPayment = async (attempt = 0) => {
      try {
        const response = await fetch(
          `/api/status?reference=${encodeURIComponent(paymentReference)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || data.message || "Verification failed");
        }

        const status = String(data.status || "").toUpperCase();

        if (cancelled) return;

        if (status === "SUCCESS") {
          const storedDate = sessionStorage.getItem("payment_time");
          const verifiedAt = storedDate
            ? new Date(storedDate)
            : new Date();

          if (Number.isNaN(verifiedAt.getTime())) {
            setPaymentDate(new Date());
          } else {
            setPaymentDate(verifiedAt);
          }

          sessionStorage.setItem("payment_status", "completed");
          setVerification("verified");
          return;
        }

        if (status === "FAILED") {
          setVerification("failed");
          setError("PayHero reports that this payment was unsuccessful.");
          return;
        }

        if (status !== "QUEUED") {
          throw new Error("Unrecognized payment status.");
        }

        if (attempt + 1 >= MAX_ATTEMPTS) {
          setVerification("pending");
          setError("Payment is still awaiting final confirmation.");
          return;
        }

        timeout = setTimeout(
          () => verifyPayment(attempt + 1),
          POLL_INTERVAL_MS
        );
      } catch (err) {
        if (cancelled) return;

        if (attempt + 1 >= MAX_ATTEMPTS) {
          setVerification("pending");
          setError(err.message || "Unable to verify payment right now.");
          return;
        }

        timeout = setTimeout(
          () => verifyPayment(attempt + 1),
          POLL_INTERVAL_MS
        );
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [paymentReference, loanData?.loan_amount]);

  // Update the elapsed-time progress bar.
  useEffect(() => {
    if (verification !== "verified") return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [verification]);

  const loanAmount = Number(loanData?.loan_amount || 0);
  const processingFee = Number(loanData?.processing_fee || 0);
  const interestRate = Number(loanData?.interest_rate ?? 10);

  const interest = (loanAmount * interestRate) / 100;
  const totalRepayment = loanAmount + processingFee + interest;
  const monthlyInstallment = totalRepayment / 4;

  const userName =
    userData?.name || userData?.customer_name || "Customer";

  const expectedDate = paymentDate
    ? new Date(
        paymentDate.getTime() + DISBURSEMENT_DAYS * 24 * 60 * 60 * 1000
      )
    : null;

  const elapsedMs = paymentDate
    ? Math.max(0, now - paymentDate.getTime())
    : 0;

  const progress = Math.min(
    100,
    Math.round(
      (elapsedMs / (DISBURSEMENT_DAYS * 24 * 60 * 60 * 1000)) * 100
    )
  );

  const remainingMs = expectedDate
    ? Math.max(0, expectedDate.getTime() - now)
    : 0;

  const remainingDays = Math.ceil(
    remainingMs / (24 * 60 * 60 * 1000)
  );

  const formattedDate = (date) =>
    date?.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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

  if (verification === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-100 border-t-emerald-600 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-800">
            Verifying Your Payment
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Please wait while we confirm your M-Pesa transaction.
          </p>
        </div>
      </div>
    );
  }

  if (verification !== "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">
            {verification === "failed"
              ? "Payment Not Successful"
              : verification === "pending"
              ? "Payment Confirmation Pending"
              : "Payment Reference Missing"}
          </h2>
          <p className="text-gray-600 mt-3 text-sm">{error || "We could not verify this transaction."}</p>
          <p className="text-xs text-gray-400 mt-3 break-all">
            Reference: {paymentReference || "Unavailable"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl"
          >
            Check Payment Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-3 text-gray-600 text-sm"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center px-4 py-10"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8"
      >
        {/* APPROVAL ICON */}
        <motion.div variants={item} className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center shadow-lg">
            <CheckCircle size={52} className="text-emerald-600" />
          </div>
        </motion.div>

        {/* APPROVAL MESSAGE */}
        <motion.div variants={item} className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
            <BadgeCheck size={17} />
            LOAN APPROVED
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Congratulations, {userName}!
          </h1>

          <p className="text-gray-600 mt-3">
            Your fee payment has been successfully verified and your loan
            has been approved.
          </p>
        </motion.div>

        {/* LOAN SUMMARY */}
        <motion.div
          variants={item}
          className="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Loan Status</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <BadgeCheck size={18} />
              Approved
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-bold text-emerald-700">
                KES {loanAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee Paid</span>
              <span className="font-semibold text-sky-700">
                KES {processingFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Interest ({interestRate}%)</span>
              <span className="font-semibold text-purple-700">
                KES {interest.toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="font-bold text-gray-800">Total Repayment</span>
              <span className="font-bold text-emerald-700">
                KES {Math.round(totalRepayment).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* DISBURSEMENT TRACKER */}
        <motion.div
          variants={item}
          className="mt-6 bg-white border border-gray-200 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2">
            <Wallet className="text-emerald-600" size={21} />
            <h3 className="font-bold text-gray-800">
              Loan Disbursement
            </h3>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Your approved loan is scheduled for disbursement within four
            days from the date your fee payment was received.
          </p>

          <div className="mt-5 flex justify-between text-sm">
            <span className="text-gray-500">Expected timeframe</span>
            <span className="font-bold text-emerald-700">4 days</span>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Payment verified</span>
            <span>{progress}% of timeframe elapsed</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Payment date</p>
              <p className="font-semibold text-sm text-gray-800 mt-1">
                {formattedDate(paymentDate)}
              </p>
            </div>

            <div className="bg-sky-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Expected date</p>
              <p className="font-semibold text-sm text-gray-800 mt-1">
                {formattedDate(expectedDate)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
            <Clock size={17} />
            {remainingDays > 0
              ? `Approximately ${remainingDays} day(s) remaining in the expected timeframe.`
              : "The four-day expected timeframe has elapsed. Disbursement confirmation is still required."}
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  Payment verified
                </p>
                <p className="text-xs text-gray-500">
                  Your M-Pesa payment has been confirmed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  Loan approved
                </p>
                <p className="text-xs text-gray-500">
                  Your loan approval is confirmed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  Disbursement
                </p>
                <p className="text-xs text-gray-500">
                  Awaiting funds transfer confirmation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PAYMENT DETAILS */}
        <motion.div
          variants={item}
          className="mt-6 bg-sky-50 rounded-2xl p-5 border border-sky-100"
        >
          <h3 className="font-bold text-sky-800 mb-4 flex items-center gap-2">
            <Receipt size={18} />
            Payment Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-600">Reference</span>
              <span className="font-medium break-all text-right">
                {paymentReference}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">
                {userData?.phone_number || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Installment</span>
              <span className="font-medium">
                KES {Math.round(monthlyInstallment).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* NEXT STEPS */}
        <motion.div
          variants={item}
          className="mt-6 bg-white border border-gray-100 rounded-2xl p-5"
        >
          <h3 className="font-bold text-gray-800 mb-4">
            What Happens Next?
          </h3>

          <div className="space-y-4">
            {[
              "Your loan approval has been confirmed.",
              "Disbursement processing will proceed.",
              "Keep your registered phone number active.",
              "Look out for disbursement confirmation.",
            ].map((text, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BUTTONS */}
        <motion.div variants={item} className="mt-8 space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <Home size={20} />
            <span>Return Home</span>
          </button>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          variants={item}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure • Fast • Reliable</span>
          </div>

          <p className="mt-2">
            © {new Date().getFullYear()} Mkopo Chapchap
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
