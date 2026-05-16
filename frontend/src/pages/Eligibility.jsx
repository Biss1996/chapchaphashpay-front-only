import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  User,
  Phone,
  IdCard,
  ChevronDown,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2
} from "lucide-react";

export default function Eligibility() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    id_number: "",
    loan_type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load saved data
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("myLoan") || "{}");
    if (saved) setFormData((prev) => ({ ...prev, ...saved }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Enhanced validation
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Please enter a valid name (letters only, 2-50 characters)";
      isValid = false;
    }

    // Phone validation (Kenyan numbers)
    const phoneRegex = /^(?:\+?254|0)[17]\d{8}$/;
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)";
      isValid = false;
    }

    // ID validation (Kenyan ID)
    const idRegex = /^\d{7,8}$/;
    if (!formData.id_number.trim()) {
      newErrors.id_number = "ID number is required";
      isValid = false;
    } else if (!idRegex.test(formData.id_number)) {
      newErrors.id_number = "Please enter a valid Kenyan ID number (7-8 digits)";
      isValid = false;
    }

    // Loan type validation
    if (!formData.loan_type) {
      newErrors.loan_type = "Please select a loan type";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Enhanced eligibility check with better UX
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem("myLoan", JSON.stringify(formData));

    const steps = [
      { text: "Verifying your identity...", icon: "🔍" },
      { text: "Checking M-Pesa transaction history...", icon: "💳" },
      { text: "Analyzing your loan behavior...", icon: "📊" },
      { text: "Calculating your eligibility score...", icon: "🎯" },
      { text: "Finalizing decision...", icon: "✅" },
    ];

    let step = 0;

    Swal.fire({
      title: "Checking Your Eligibility",
      html: `
        <div class="text-center">
          <div class="text-4xl mb-4">${steps[step].icon}</div>
          <p class="text-lg">${steps[step].text}</p>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: ${(step / steps.length) * 100}%"></div>
            </div>
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
                  </div>
                </div>
              `,
            });
          } else {
            clearInterval(interval);
            setIsLoading(false);

            // Random eligibility decision (80% chance of approval for demo)
            const isEligible = Math.random() > 0.2;

            if (isEligible) {
              Swal.fire({
                icon: "success",
                title: "Congratulations! 🎉",
                html: `
                  <div class="text-center">
                    <div class="text-4xl mb-4">✅</div>
                    <p class="text-lg">You are <b>eligible</b> for instant loans!</p>
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p class="text-blue-800 font-semibold">Pre-Approved Status</p>
                      <p class="text-blue-600 text-sm">Based on your M-Pesa activity and credit history</p>
                    </div>
                  </div>
                `,
                confirmButtonText: "Continue to Application",
                confirmButtonColor: "#2563eb",
                allowOutsideClick: false,
              }).then(() => {
                navigate("/apply");
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Not Eligible at This Time",
                html: `
                  <div class="text-center">
                    <div class="text-4xl mb-4">❌</div>
                    <p class="text-lg">We're unable to approve your application at this moment.</p>
                    <div class="mt-4 p-4 bg-red-50 rounded-lg">
                      <p class="text-red-800 font-semibold">Possible Reasons:</p>
                      <ul class="text-red-600 text-sm text-left mt-2">
                        <li>• Insufficient M-Pesa activity</li>
                        <li>• Recent loan defaults</li>
                        <li>• Incomplete profile information</li>
                      </ul>
                    </div>
                    <p class="mt-4 text-gray-600">You can reapply in 30 seconds</p>
                  </div>
                `,
                confirmButtonText: "Try Again",
                confirmButtonColor: "#ef4444",
                allowOutsideClick: false,
              }).then(() => {
                // Stay on the same page to let user correct info
              });
            }
          }
        }, 1500); // Faster steps for better UX
      },
    });
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4"
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white text-center relative"
        >
          <div className="absolute top-4 left-4">
            <ShieldCheck size={24} className="opacity-80" />
          </div>
          <h1 className="text-2xl font-bold">Loan Eligibility Check</h1>
          <p className="text-sm opacity-90 mt-1">
            Fast M-Pesa loan approval in minutes
          </p>
        </motion.div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <motion.div
            variants={item}
            className="bg-blue-50 border border-blue-100 text-blue-700 text-xs p-3 rounded-lg flex items-center space-x-2"
          >
            <ShieldCheck size={16} />
            <span>Your information is secure and encrypted with 256-bit SSL</span>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <motion.div variants={item}>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name (as on ID)"
                  className={`w-full p-3 pl-12 rounded-xl border ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 outline-none transition-all`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <XCircle size={14} />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={item}>
              <div className="relative">
                <Phone
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number (e.g., 0712345678)"
                  className={`w-full p-3 pl-12 rounded-xl border ${
                    errors.phone_number ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 outline-none transition-all`}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <XCircle size={14} />
                    <span>{errors.phone_number}</span>
                  </p>
                )}
              </div>
            </motion.div>

            {/* ID Number */}
            <motion.div variants={item}>
              <div className="relative">
                <IdCard
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="id_number"
                  placeholder="National ID Number"
                  className={`w-full p-3 pl-12 rounded-xl border ${
                    errors.id_number ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 outline-none transition-all`}
                  value={formData.id_number}
                  onChange={handleChange}
                />
                {errors.id_number && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <XCircle size={14} />
                    <span>{errors.id_number}</span>
                  </p>
                )}
              </div>
            </motion.div>

            {/* Loan Type */}
            <motion.div variants={item}>
              <div className="relative">
                <ChevronDown
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  name="loan_type"
                  className={`w-full p-3 rounded-xl border ${
                    errors.loan_type ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 outline-none bg-white appearance-none transition-all`}
                  value={formData.loan_type}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Loan Type
                  </option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Medical Loan">Medical Loan</option>
                  <option value="Emergency Loan">Emergency Loan</option>
                </select>
                {errors.loan_type && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <XCircle size={14} />
                    <span>{errors.loan_type}</span>
                  </p>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={item}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold shadow-md hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Check Eligibility</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer Info */}
          <motion.div
            variants={item}
            className="text-center text-xs text-gray-400 mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center space-x-4"
          >
            <div className="flex items-center space-x-1">
              <CheckCircle size={14} className="text-green-500" />
              <span>No CRB check</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} className="text-blue-500" />
              <span>Instant decision</span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck size={14} className="text-purple-500" />
              <span>Secure application</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}