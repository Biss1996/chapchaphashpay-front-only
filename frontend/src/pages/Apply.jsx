import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Tag,
  Info
} from "lucide-react";

export default function Apply() {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [hoveredLoan, setHoveredLoan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("myLoan") || "{}");

  const loans = [
    { amount: 5500, fee: 100, interestRate: 5, term: "7 days" },
    { amount: 6800, fee: 130, interestRate: 5, term: "14 days" },
    { amount: 7800, fee: 170, interestRate: 5, term: "14 days" },
    { amount: 9800, fee: 190, interestRate: 5, term: "30 days" },
    { amount: 11200, fee: 230, interestRate: 7, term: "30 days" },
    { amount: 16800, fee: 250, interestRate: 7, term: "30 days" },
    { amount: 21200, fee: 270, interestRate: 8, term: "30 days" },
    { amount: 25600, fee: 400, interestRate: 8, term: "60 days" },
    { amount: 30000, fee: 470, interestRate: 10, term: "60 days" },
    { amount: 35400, fee: 590, interestRate: 10, term: "60 days" },
    { amount: 39800, fee: 730, interestRate: 12, term: "90 days" },
    { amount: 44200, fee: 1010, interestRate: 12, term: "90 days" },
    { amount: 48600, fee: 1600, interestRate: 15, term: "90 days" },
    { amount: 60600, fee: 2050, interestRate: 15, term: "120 days" },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const loanItem = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.02, y: -5, transition: { duration: 0.2 } },
    selected: { scale: 1.05, borderColor: "#0ea5e9", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
  };

  const handleSelect = (loan) => {
    setSelectedLoan(loan);

    const updated = {
      ...userData,
      loan_amount: loan.amount,
      processing_fee: loan.fee,
      interest_rate: loan.interestRate,
      term: loan.term,
    };

    sessionStorage.setItem("myLoan", JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!selectedLoan) {
      toast.error("Please select a loan amount to continue");
      return;
    }

    setIsSubmitting(true);

    const steps = [
      { text: "Checking your M-Pesa history...", icon: "💳" },
      { text: "Analyzing your credit profile...", icon: "📊" },
      { text: "Verifying your identity...", icon: "🔍" },
      { text: "Calculating your eligibility score...", icon: "🎯" },
      { text: "Final approval in progress...", icon: "✅" },
    ];

    let step = 0;

    Swal.fire({
      title: "Processing Your Loan Application",
      html: `
        <div class="text-center">
          <div class="text-4xl mb-4">${steps[step].icon}</div>
          <p class="text-lg">${steps[step].text}</p>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: ${(step / steps.length) * 100}%"></div>
            </div>
            <p class="text-xs text-gray-500 mt-2">${Math.round((step / steps.length) * 100)}% complete</p>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();

        const interval = setInterval(() => {
          step++;

          if (step < steps.length) {
            Swal.update({
              html: `
                <div class="text-center">
                  <div class="text-4xl mb-4">${steps[step].icon}</div>
                  <p class="text-lg">${steps[step].text}</p>
                  <div class="mt-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" style="width: ${(step / steps.length) * 100}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">${Math.round((step / steps.length) * 100)}% complete</p>
                  </div>
                </div>
              `,
            });
          } else {
            clearInterval(interval);
            setIsSubmitting(false);

            // Calculate total repayment
            const totalRepayment = selectedLoan.amount + selectedLoan.fee +
                                  (selectedLoan.amount * selectedLoan.interestRate / 100);

            Swal.fire({
              icon: "success",
              title: "Congratulations! 🎉",
              html: `
                <div class="text-center">
                  <div class="text-4xl mb-4">✅</div>
                  <p class="text-lg">You have been <b>pre-approved</b> for</p>
                  <h2 style="margin-top:10px;color:#2563eb;font-size:2rem;font-weight:bold;">
                    KES ${selectedLoan.amount.toLocaleString()}
                  </h2>
                  <div class="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                    <p class="text-blue-800"><strong>Loan Details:</strong></p>
                    <p class="text-blue-600 text-sm">
                      • Processing Fee: KES ${selectedLoan.fee.toLocaleString()}<br/>
                      • Interest (${selectedLoan.interestRate}%): KES ${(selectedLoan.amount * selectedLoan.interestRate / 100).toLocaleString()}<br/>
                      • Total Repayment: KES ${totalRepayment.toLocaleString()}<br/>
                      • Term: ${selectedLoan.term}
                    </p>
                  </div>
                </div>
              `,
              confirmButtonText: "Continue to Payment",
              confirmButtonColor: "#2563eb",
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                const current = JSON.parse(sessionStorage.getItem("myLoan") || "{}");
                sessionStorage.setItem(
                  "myLoan",
                  JSON.stringify({
                    ...current,
                    loan_amount: selectedLoan.amount,
                    processing_fee: selectedLoan.fee,
                    interest_rate: selectedLoan.interestRate,
                    term: selectedLoan.term,
                    total_repayment: totalRepayment,
                  })
                );
                navigate("/payment", { replace: true });
              }
            });
          }
        }, 1000);
      },
    });
  };

  // Calculate best value
  const getBestValue = () => {
    if (!loans.length) return null;
    // Find loan with lowest interest rate to amount ratio
    return loans.reduce((best, current) =>
      (current.fee / current.amount) < (best.fee / best.amount) ? current : best
    );
  };

  const bestValue = getBestValue();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <motion.div
            variants={item}
            className="flex items-center space-x-3 mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Loan Offers for You</h1>
              <p className="text-sm text-gray-500">
                Hi <span className="font-semibold text-blue-600">{userData.name || "Customer"}</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 rounded-xl"
          >
            <div className="flex items-center space-x-2 text-blue-700">
              <Sparkles size={18} />
              <span className="font-medium">Instant approval</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-700 mt-2">
              <ShieldCheck size={18} />
              <span className="font-medium">AI-based scoring • M-Pesa disbursement</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Best Value Highlight */}
        {bestValue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl mb-6 flex items-center space-x-3"
          >
            <Tag size={20} />
            <div>
              <p className="font-bold">Best Value Offer</p>
              <p className="text-sm opacity-90">
                KES {bestValue.amount.toLocaleString()} • Lowest fee ratio
              </p>
            </div>
          </motion.div>
        )}

        {/* Loans Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <motion.h2
            variants={item}
            className="text-center font-semibold text-gray-700 mb-6 flex items-center justify-center space-x-2"
          >
            <TrendingUp size={20} className="text-blue-500" />
            <span>Select Your Loan Amount</span>
          </motion.h2>

          <div className="grid grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-2">
            {loans.map((loan, index) => (
              <motion.div
                key={index}
                variants={loanItem}
                initial="hidden"
                animate={selectedLoan?.amount === loan.amount ? "selected" : "show"}
                whileHover="hover"
                onClick={() => handleSelect(loan)}
                onHoverStart={() => setHoveredLoan(loan.amount)}
                onHoverEnd={() => setHoveredLoan(null)}
                className={`cursor-pointer rounded-xl p-4 text-center border-2 transition-all duration-200
                  ${
                    selectedLoan?.amount === loan.amount
                      ? "bg-blue-50 border-blue-500 shadow-lg"
                      : hoveredLoan === loan.amount
                      ? "bg-gray-50 border-blue-200 shadow-md"
                      : "bg-white border-gray-100 hover:border-blue-100"
                  }`}
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-bold text-gray-800 text-lg">
                    KES {loan.amount.toLocaleString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Fee: <span className="font-semibold text-blue-600">KES {loan.fee.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {loan.interestRate}% • {loan.term}
                    </p>
                  </div>
                  {selectedLoan?.amount === loan.amount && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-2"
                    >
                      <CheckCircle size={18} className="text-blue-500 mx-auto" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Selected Summary */}
          {selectedLoan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={18} className="text-blue-500" />
                <h3 className="font-semibold text-blue-800">Selected Loan</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-bold text-gray-800">KES {selectedLoan.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Processing Fee</p>
                  <p className="font-bold text-gray-800">KES {selectedLoan.fee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Interest Rate</p>
                  <p className="font-bold text-gray-800">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Term</p>
                  <p className="font-bold text-gray-800">{selectedLoan.term}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100">
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <Info size={14} className="text-blue-400" />
                  <span>Total repayment: KES {(selectedLoan.amount + selectedLoan.fee +
                    (selectedLoan.amount * selectedLoan.interestRate / 100)).toLocaleString()}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={handleSubmit}
              disabled={!selectedLoan || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2
                ${
                  selectedLoan && !isSubmitting
                    ? "bg-gradient-to-r from-blue-600 to-emerald-600 hover:shadow-lg hover:scale-[1.02]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Get Loan Now</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {!selectedLoan && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-red-500 mt-2 flex items-center justify-center space-x-1"
              >
                <Info size={14} />
                <span>Select a loan offer to continue</span>
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Loan Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap size={18} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Pro Tip</h4>
              <p className="text-sm text-gray-600 mt-1">
                Choose a loan amount that fits your needs. Remember, higher amounts may have longer repayment terms.
                Our AI will help determine the best option for you based on your M-Pesa history.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}