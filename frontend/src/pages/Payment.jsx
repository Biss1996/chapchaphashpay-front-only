import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { initiateSTKPush } from "../services/hashpay";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("loanFormData") || "null");
    const loan = JSON.parse(sessionStorage.getItem("myLoan") || "null");

    if (!data || !loan) {
      navigate("/apply");
      return;
    }

    setFormData(data);
    setLoanData(loan);
  }, [navigate]);

  const handlePay = async () => {
    if (!loanData) return toast.error("Loan data missing");

    Swal.fire({
      title: "Processing Payment",
      html: `
        We are sending an M-Pesa STK Push...<br/>
        <b>Please wait and enter your M-Pesa PIN when prompted</b>
      `,
      icon: "info",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setLoading(true);

    try {
      const response = await initiateSTKPush(
        formData.phoneNumber,
        loanData.processing_fee,
        `LOAN-${Date.now()}`
      );

      Swal.close();

      if (response.success) {
        toast.success("STK Push sent! Check your phone.");

        Swal.fire({
          title: "Check Your Phone 📱",
          text: "Enter your M-Pesa PIN to complete activation.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        setTimeout(() => navigate("/success"), 2500);
      } else {
        toast.error("Failed to initiate payment.");

        Swal.fire({
          title: "Payment Failed",
          text: "We couldn't send the STK Push. Try again.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.close();
      toast.error("Payment error. Try again.");

      Swal.fire({
        title: "Error",
        text: "Something went wrong while initiating payment.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!formData || !loanData) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Loan Activation</h1>
          <p className="text-sm opacity-90 mt-1">
            Secure M-Pesa Checkout
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* LOAN AMOUNT (CATCHY HERO CARD) */}
          <div className="bg-gradient-to-r from-emerald-500 to-sky-500 rounded-xl p-6 text-center text-white shadow-lg">

            <p className="text-sm opacity-90">
               Congratulations! You are approved for
            </p>

            <p className="text-5xl font-extrabold mt-2 tracking-tight">
              KES {loanData.loan_amount?.toLocaleString() || 0}
            </p>

            <p className="mt-3 text-xs bg-white/20 inline-block px-3 py-1 rounded-full">
              ✔ Pre-approved • No CRB check • Fast approval
            </p>
          </div>

          {/* PROCESSING FEE (PAYMENT) */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">

            <p className="text-sm text-gray-500">Activation Fee</p>

            <p className="text-3xl font-bold text-gray-900 mt-1">
              KES {loanData.processing_fee?.toLocaleString() || 0}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              One-time fee required to release your loan
            </p>
          </div>

          {/* PHONE */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-600">M-Pesa Number</p>
            <p className="text-lg font-semibold text-gray-900">
              {formData.phoneNumber}
            </p>
          </div>

          {/* INFO */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            You will receive an <span className="font-semibold">STK Push</span>.
            Enter your M-Pesa PIN to activate your loan.
          </div>

          {/* BUTTON */}
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : (
            <button
              onClick={handlePay}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              Activate Loan via M-Pesa
            </button>
          )}

          {/* SECURITY */}
          <p className="text-center text-xs text-gray-400 mt-2">
            🔒 Secure M-Pesa STK Push Payment
          </p>

        </div>
      </div>
    </div>
  );
}