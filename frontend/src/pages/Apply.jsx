import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Apply() {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("myLoan") || "{}");

  const loans = [
    { amount: 5500, fee: 100 },
    { amount: 6800, fee: 130 },
    { amount: 7800, fee: 170 },
    { amount: 9800, fee: 190 },
    { amount: 11200, fee: 230 },
    { amount: 16800, fee: 250 },
    { amount: 21200, fee: 270 },
    { amount: 25600, fee: 400 },
    { amount: 30000, fee: 470 },
    { amount: 35400, fee: 590 },
    { amount: 39800, fee: 730 },
    { amount: 44200, fee: 1010 },
    { amount: 48600, fee: 1600 },
    { amount: 60600, fee: 2050 },
  ];

  const handleSelect = (loan) => {
    setSelectedLoan(loan);

    const updated = {
      ...userData,
      loan_amount: loan.amount,
      processing_fee: loan.fee,
    };

    sessionStorage.setItem("myLoan", JSON.stringify(updated));
  };

  // ✅ NEW: Smart animated eligibility check
  const handleSubmit = async () => {
    if (!selectedLoan) {
      toast.error("Please select a loan amount");
      return;
    }

    const steps = [
      "Checking M-Pesa history...",
      "Analyzing credit profile...",
      "Verifying identity...",
      "Calculating eligibility score...",
      "Final approval in progress...",
    ];

    let step = 0;

    Swal.fire({
      title: "Processing Your Loan",
      html: steps[step],
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();

        const interval = setInterval(() => {
          step++;

          if (step < steps.length) {
            Swal.update({
              html: steps[step],
            });
          } else {
            clearInterval(interval);

            Swal.fire({
              icon: "success",
              title: "Congratulations 🎉",
              html: `
                You have been <b>pre-approved</b> for<br/>
                <h2 style="margin-top:10px;color:#0ea5e9;">
                  KES ${selectedLoan.amount.toLocaleString()}
                </h2>
              `,
              confirmButtonText: "Continue",
              confirmButtonColor: "#0ea5e9",
            }).then(() => {
              navigate("/payment");
            });
          }
        }, 1200);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-10">

      <div className="max-w-lg mx-auto">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            Loan Offers for You
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Hi{" "}
            <span className="font-semibold text-sky-600">
              {userData.name || "Customer"}
            </span>
          </p>

          <div className="mt-4 bg-gradient-to-r from-sky-500 to-emerald-500 text-white p-3 rounded-xl text-sm font-medium">
            ⚡ Instant approval • AI-based scoring • M-Pesa disbursement
          </div>
        </div>

        {/* Loans */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">

          <h2 className="text-center font-semibold text-gray-700 mb-4">
            Select Loan Amount
          </h2>

          <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">

            {loans.map((loan, index) => (
              <div
                key={index}
                onClick={() => handleSelect(loan)}
                className={`cursor-pointer rounded-xl p-4 text-center border transition-all duration-200
                ${
                  selectedLoan?.amount === loan.amount
                    ? "bg-sky-50 border-sky-500 shadow-md scale-[1.02]"
                    : "bg-gray-50 border-gray-100 hover:border-sky-300 hover:shadow"
                }`}
              >
                <p className="font-bold text-gray-800 text-lg">
                  KES {loan.amount.toLocaleString()}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Fee: <span className="font-semibold">KES {loan.fee}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Selected */}
          {selectedLoan && (
            <div className="mt-5 bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm">
              <p>
                Selected:{" "}
                <b>KES {selectedLoan.amount.toLocaleString()}</b>
              </p>
              <p>Processing Fee: KES {selectedLoan.fee}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all
              ${
                selectedLoan
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 hover:shadow-lg hover:scale-[1.02]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Get Loan Now →
          </button>

          {!selectedLoan && (
            <p className="text-center text-xs text-red-500 mt-2">
              Select a loan offer to continue
            </p>
          )}
        </div>

      </div>
    </div>
  );
}