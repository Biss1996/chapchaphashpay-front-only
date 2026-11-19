import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";

const LOAN_OPTIONS = [
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

const formatKES = (value) => `KES ${Number(value || 0).toLocaleString("en-KE")}`;

function readLoanData() {
  try {
    return JSON.parse(sessionStorage.getItem("myLoan") || "{}");
  } catch {
    return {};
  }
}

export default function Apply() {
  const navigate = useNavigate();
  const [userData] = useState(readLoanData);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedAmount = Number(userData.loan_amount);
    const saved = LOAN_OPTIONS.find((loan) => loan.amount === savedAmount);
    if (saved) setSelectedLoan(saved);
  }, [userData.loan_amount]);

  const bestValue = useMemo(
    () => LOAN_OPTIONS.reduce((best, current) =>
      current.fee / current.amount < best.fee / best.amount ? current : best
    ),
    []
  );

  const interestFor = (loan) => loan.amount * (loan.interestRate / 100);
  const totalRepaymentFor = (loan) => loan.amount + loan.fee + interestFor(loan);

  const handleSelect = (loan) => {
    setSelectedLoan(loan);
    const updated = {
      ...readLoanData(),
      loan_amount: loan.amount,
      processing_fee: loan.fee,
      interest_rate: loan.interestRate,
      term: loan.term,
    };
    sessionStorage.setItem("myLoan", JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!selectedLoan || isSubmitting) {
      if (!selectedLoan) toast.error("Please select a loan amount to continue");
      return;
    }

    setIsSubmitting(true);
    const steps = [
      "Preparing your selected offer...",
      "Calculating the repayment summary...",
      "Saving your selection...",
      "Getting your payment details ready...",
    ];

    let step = 0;
    const progressHtml = () => `
      <div style="text-align:center;padding:8px 4px 2px">
        <div style="width:52px;height:52px;border-radius:16px;background:#eff6ff;color:#2563eb;display:grid;place-items:center;margin:0 auto 18px;font-size:24px">✓</div>
        <p style="font-size:14px;color:#334155;margin:0 0 18px">${steps[step]}</p>
        <div style="height:7px;background:#e2e8f0;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${Math.round(((step + 1) / steps.length) * 100)}%;background:linear-gradient(90deg,#2563eb,#0d9488);border-radius:99px;transition:width .25s"></div>
        </div>
        <p style="font-size:11px;color:#64748b;margin:9px 0 0">${Math.round(((step + 1) / steps.length) * 100)}% complete</p>
      </div>`;

    let interval;
    try {
      const processing = Swal.fire({
        title: "Preparing your offer",
        html: progressHtml(),
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          interval = window.setInterval(() => {
            step += 1;
            if (step < steps.length) {
              Swal.update({ html: progressHtml() });
            } else {
              window.clearInterval(interval);
              Swal.close();
            }
          }, 650);
        },
        willClose: () => window.clearInterval(interval),
      });
      await processing;

      const totalRepayment = totalRepaymentFor(selectedLoan);
      const current = readLoanData();
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

      const result = await Swal.fire({
        icon: "success",
        title: "Your offer is ready",
        html: `
          <div style="text-align:left">
            <p style="color:#475569;font-size:14px;text-align:center;margin:0 0 16px">Review your selected offer before proceeding.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px">
              <div style="font-size:12px;color:#64748b">Selected amount</div>
              <div style="font-size:27px;font-weight:800;color:#1d4ed8;margin:2px 0 14px">${formatKES(selectedLoan.amount)}</div>
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;margin:8px 0"><span style="color:#64748b">Processing fee</span><strong>${formatKES(selectedLoan.fee)}</strong></div>
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;margin:8px 0"><span style="color:#64748b">Interest (${selectedLoan.interestRate}%)</span><strong>${formatKES(interestFor(selectedLoan))}</strong></div>
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;margin:8px 0"><span style="color:#64748b">Repayment term</span><strong>${selectedLoan.term}</strong></div>
              <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;gap:12px;font-size:14px"><strong>Total repayment</strong><strong style="color:#0f766e">${formatKES(totalRepayment)}</strong></div>
            </div>
            <p style="font-size:11px;line-height:1.5;color:#64748b;margin:12px 2px 0">This is an offer summary, not confirmation of loan approval or disbursement. Review the terms before making any payment.</p>
          </div>`,
        confirmButtonText: "Continue to payment",
        confirmButtonColor: "#2563eb",
        cancelButtonText: "Review offers",
        showCancelButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
      });

      if (result.isConfirmed) navigate("/payment", { replace: true });
    } catch (error) {
      console.error("Unable to prepare selected offer:", error);
      toast.error("We couldn't prepare your offer. Please try again.");
    } finally {
      window.clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36 sm:pb-32">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-9 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-5 text-white shadow-xl shadow-blue-950/10 sm:mb-7 sm:p-8"
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
                <Sparkles size={14} /> PERSONALIZED OFFER OPTIONS
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Choose an amount that works for you</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                {`Welcome${userData.name ? `, ${userData.name}` : ""}. Compare the available amounts, fees and repayment terms before continuing.`}
              </p>
            </div>
            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex">
              <Wallet size={38} className="text-cyan-200" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-2 border-t border-white/10 pt-4 text-xs text-slate-300 sm:grid-cols-2 sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-teal-300" /> Review terms before proceeding</div>
            <div className="flex items-center gap-2"><Clock3 size={16} className="text-teal-300" /> Clear repayment periods and fees</div>
          </div>
        </motion.header>

        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Available options</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Select your loan amount</h2>
            <p className="mt-1 text-sm text-slate-500">Tap an option to view it as your selection.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            <Tag size={14} /> Best fee-to-amount ratio: {formatKES(bestValue.amount)}
          </div>
        </div>

        {/* Keep the grid in normal page flow. It deliberately has no nested scroll area. */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          aria-label="Available loan amounts"
        >
          {LOAN_OPTIONS.map((loan) => {
            const isSelected = selectedLoan?.amount === loan.amount;
            const isBest = bestValue.amount === loan.amount;
            return (
              <motion.button
                key={loan.amount}
                type="button"
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(loan)}
                aria-pressed={isSelected}
                className={`group relative min-h-[142px] rounded-2xl border p-3 text-left shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:min-h-[158px] sm:p-4 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-900/10 ring-2 ring-blue-600/15"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {isBest && (
                  <span className="absolute -top-2 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                    Best value
                  </span>
                )}
                <span className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Loan amount</span>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-transparent group-hover:border-blue-400"}`}>
                    {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                </span>
                <span className="mt-3 block text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">{formatKES(loan.amount)}</span>
                <span className="mt-3 block space-y-1.5 border-t border-slate-100 pt-2.5">
                  <span className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                    <span className="text-slate-500">Processing fee</span>
                    <strong className="text-slate-700">{formatKES(loan.fee)}</strong>
                  </span>
                  <span className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                    <span className="text-slate-500">Interest / term</span>
                    <strong className="text-slate-700">{loan.interestRate}% · {loan.term}</strong>
                  </span>
                </span>
                {isSelected && <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 sm:text-xs"><CheckCircle2 size={13} /> Selected</span>}
              </motion.button>
            );
          })}
        </motion.section>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><ShieldCheck size={17} className="text-teal-600" /> Before you continue</div>
            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">Check the processing fee, interest rate, total repayment and repayment period. Only proceed if the terms are suitable for you.</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900"><Info size={17} className="text-blue-600" /> How the total is calculated</div>
            <p className="mt-2 text-xs leading-5 text-blue-800/75 sm:text-sm">Total repayment shown below includes the selected amount, the listed processing fee and the stated interest rate.</p>
          </div>
        </div>
      </main>

      {/* Persistent action bar: selection and next step stay visible on mobile and desktop. */}
      <AnimatePresence>
        {selectedLoan && (
          <motion.aside
            initial={{ y: 35, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 35, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-12px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl"
            aria-label="Selected offer and continue action"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs"><BadgeCheck size={14} /> Your selected offer</div>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{formatKES(selectedLoan.amount)}</span>
                  <span className="text-[11px] text-slate-500 sm:text-xs">Fee {formatKES(selectedLoan.fee)} · {selectedLoan.interestRate}% · {selectedLoan.term}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">Total repayment: <span className="font-bold text-slate-700">{formatKES(totalRepaymentFor(selectedLoan))}</span></div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[230px]"
              >
                {isSubmitting ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Preparing offer...</>
                ) : (
                  <>Continue <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!selectedLoan && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 text-center text-xs text-slate-500 backdrop-blur sm:hidden">
          <span className="inline-flex items-center gap-2"><Info size={14} /> Select an offer to continue</span>
        </div>
      )}
    </div>
  );
}
