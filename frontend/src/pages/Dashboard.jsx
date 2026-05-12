import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  CreditCard,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Copy,
  MoreVertical,
  Home,
  Settings,
  Bell,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { toast } from "react-toastify";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
    loan: {},
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const paymentStatus = sessionStorage.getItem("payment_status");
    const loanData = JSON.parse(sessionStorage.getItem("myLoan") || "{}");
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

    if (paymentStatus !== "completed") {
      navigate("/apply");
      return;
    }

    setData({
      name: userData.name || "User",
      loan: loanData,
    });

    setLoading(false);
  }, [navigate]);

  const generateRef = () => {
    return `MKP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const formatDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyReference = () => {
    const ref = `MKP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    navigator.clipboard.writeText(ref);
    toast.success("Reference copied to clipboard!");
  };

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getRepaymentPlan = () => {
    const amount = parseInt(data.loan.loan_amount || 0);
    const fee = parseInt(data.loan.processing_fee || 0);
    const total = amount + fee;
    const interest = total * 0.1; // 10% interest
    const repayment = total + interest;

    return {
      principal: amount,
      fee: fee,
      interest: interest,
      total: repayment,
      monthly: (repayment / 4).toFixed(2) // Assuming 4 months repayment
    };
  };

  const getProgress = () => {
    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(startDate.getDate() + 60);
    const totalDays = 60;
    const daysPassed = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    return Math.min((daysPassed / totalDays) * 100, 100);
  };

  const repaymentData = getRepaymentPlan();
  const progress = getProgress();

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

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <span className="font-bold text-xl">Mkopo Chapchap</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <Settings size={20} />
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="mb-8"
        >
          <motion.h1
            variants={item}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            Welcome back, <span className="text-blue-600">{data.name}!</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="text-gray-600"
          >
            Here's your loan status and repayment information
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              title: "Loan Amount",
              value: `KES ${parseInt(data.loan.loan_amount || 0).toLocaleString()}`,
              icon: <CreditCard size={24} className="text-blue-600" />,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Processing Fee",
              value: `KES ${parseInt(data.loan.processing_fee || 0).toLocaleString()}`,
              icon: <Clock size={24} className="text-emerald-600" />,
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-emerald-50"
            },
            {
              title: "Total Repayment",
              value: `KES ${repaymentData.total.toLocaleString()}`,
              icon: <TrendingUp size={24} className="text-purple-600" />,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 ${stat.bgColor}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loan Card */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Your Loan</h2>
                <p className="text-white/80">Active Loan Details</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Approved</span>
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[
                {
                  label: "Loan Amount",
                  value: `KES ${parseInt(data.loan.loan_amount || 0).toLocaleString()}`,
                  icon: <CreditCard size={18} className="text-blue-500" />
                },
                {
                  label: "Processing Fee",
                  value: `KES ${parseInt(data.loan.processing_fee || 0).toLocaleString()}`,
                  icon: <Clock size={18} className="text-emerald-500" />
                },
                {
                  label: "Interest (10%)",
                  value: `KES ${repaymentData.interest.toLocaleString()}`,
                  icon: <TrendingUp size={18} className="text-purple-500" />
                },
                {
                  label: "Total Repayment",
                  value: `KES ${repaymentData.total.toLocaleString()}`,
                  icon: <BarChart3 size={18} className="text-orange-500" />
                },
                {
                  label: "Monthly Installment",
                  value: `KES ${parseInt(repaymentData.monthly).toLocaleString()}`,
                  icon: <Calendar size={18} className="text-green-500" />
                },
                {
                  label: "Due Date",
                  value: formatDate(60),
                  icon: <Calendar size={18} className="text-red-500" />
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reference Number */}
            <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Reference Number</p>
                <p className="font-mono font-bold text-blue-600">{generateRef()}</p>
              </div>
              <button
                onClick={copyReference}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
              >
                <Copy size={18} />
                <span className="text-sm">Copy</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Start Date</span>
                <span className="text-sm text-gray-500">Due Date ({formatDate(60)})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(progress)}% of repayment period completed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Repayment Schedule */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Repayment Schedule</h3>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <MoreVertical size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { month: 1, amount: parseInt(repaymentData.monthly).toLocaleString(), date: formatDate(30), status: "Pending" },
                { month: 2, amount: parseInt(repaymentData.monthly).toLocaleString(), date: formatDate(60), status: "Pending" },
                { month: 3, amount: parseInt(repaymentData.monthly).toLocaleString(), date: formatDate(90), status: "Pending" },
                { month: 4, amount: parseInt(repaymentData.monthly).toLocaleString(), date: formatDate(120), status: "Pending" }
              ].map((installment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">Installment {installment.month}</p>
                    <p className="text-sm text-gray-500">{installment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">KES {installment.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      installment.status === "Paid" ? "bg-green-100 text-green-600" :
                      installment.status === "Late" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {installment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: <Home size={24} className="text-blue-600" />,
              label: "Home",
              action: () => navigate("/")
            },
            {
              icon: <CreditCard size={24} className="text-emerald-600" />,
              label: "New Loan",
              action: () => navigate("/apply")
            },
            {
              icon: <Calendar size={24} className="text-purple-600" />,
              label: "Payments",
              action: () => toast.info("Payment history coming soon!")
            },
            {
              icon: <Settings size={24} className="text-gray-600" />,
              label: "Settings",
              action: () => toast.info("Settings coming soon!")
            }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-center"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg"
      >
        <div className="flex justify-around">
          {[
            { icon: <Home size={22} />, label: "Home", active: false },
            { icon: <CreditCard size={22} />, label: "Loans", active: true },
            { icon: <Calendar size={22} />, label: "Payments", active: false },
            { icon: <User size={22} />, label: "Profile", active: false }
          ].map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                item.active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}