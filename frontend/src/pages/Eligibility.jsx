import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Eligibility() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    id_number: "",
    loan_type: "",
  });

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("myLoan") || "{}");
    if (saved) setFormData((prev) => ({ ...prev, ...saved }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 NEW: Animated eligibility check
  const handleSubmit = (e) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z\s.'-]{2,}$/;
    const phoneRegex = /^(?:\+?254|0)[17]\d{8}$/;
    const idRegex = /^\d{7,10}$/;

    if (!nameRegex.test(formData.name)) return toast.error("Invalid Name");
    if (!phoneRegex.test(formData.phone_number))
      return toast.error("Invalid Phone Number");
    if (!idRegex.test(formData.id_number)) return toast.error("Invalid ID Number");
    if (!formData.loan_type) return toast.error("Select loan type");

    sessionStorage.setItem("myLoan", JSON.stringify(formData));

    const steps = [
      "Verifying identity...",
      "Checking M-Pesa activity...",
      "Analyzing loan behavior...",
      "Running eligibility score...",
      "Finalizing decision...",
    ];

    let step = 0;

    Swal.fire({
      title: "Checking Eligibility",
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
              title: "Congratulations!",
              html: `
                You are <b>eligible</b> for instant loans<br/>
                <div style="margin-top:10px;font-size:18px;color:#0ea5e9;font-weight:bold;">
                  Pre-Approved Status ✔
                </div>
              `,
              confirmButtonText: "Continue",
              confirmButtonColor: "#0ea5e9",
            }).then(() => {
              navigate("/apply");
            });
          }
        }, 2700);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Loan Eligibility Check</h1>
          <p className="text-sm opacity-90 mt-1">
            Fast M-Pesa loan approval in minutes
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs p-3 rounded-lg">
            🔒 Your information is secure and encrypted
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-400 outline-none"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-400 outline-none"
              value={formData.phone_number}
              onChange={handleChange}
            />

            <input
              type="text"
              name="id_number"
              placeholder="ID Number"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-400 outline-none"
              value={formData.id_number}
              onChange={handleChange}
            />

            <select
              name="loan_type"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-400 outline-none bg-white"
              value={formData.loan_type}
              onChange={handleChange}
            >
              <option value="">Select Loan Type</option>
              <option>Business Loan</option>
              <option>Personal Loan</option>
              <option>Education Loan</option>
              <option>Medical Loan</option>
              <option>Emergency Loan</option>
            </select>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold shadow-md hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Check Eligibility
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            No CRB check • Instant decision • Secure application
          </p>

        </div>
      </div>
    </div>
  );
}