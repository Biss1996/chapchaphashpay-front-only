import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bolt, FileText, ShieldCheck, Smartphone, Users, TrendingUp, Clock, Star } from "lucide-react";
import testimonials from "../data/testimonials";

export default function Home() {
  const navigate = useNavigate();
  const [count, setCount] = useState(12458);
  const [index, setIndex] = useState(0);

  // 🔥 Live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Testimonial slider
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 font-[Poppins]">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 text-white overflow-hidden">
        {/* Background waves */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1
              variants={staggerItem}
              className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              Get <span className="text-emerald-300">Instant Loans</span> in
              <br />
              <span className="text-emerald-300">Minutes with M-Pesa</span>
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10"
            >
              No paperwork. No collateral. Just fast cash when you need it most.
              Apply now and get approved in minutes!
            </motion.p>

            <motion.button
              variants={staggerItem}
              onClick={() => navigate("/eligibility")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2 text-lg"
            >
              <span>Apply Now</span>
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ==================== LIVE COUNTER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-xl mx-auto -mt-16 bg-white shadow-xl rounded-2xl p-6 text-center border border-gray-100"
      >
        <h2 className="text-sm text-gray-500 flex items-center justify-center space-x-2">
          <TrendingUp size={16} className="text-blue-500" />
          <span>Live Loan Approvals Today</span>
        </h2>
        <p className="text-4xl md:text-5xl font-extrabold text-blue-600 mt-3 animate-pulse">
          {count.toLocaleString()}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Loans successfully disbursed in the last 24 hours
        </p>
      </motion.div>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2
            variants={staggerItem}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Why Choose <span className="text-blue-600">Mkopo Chapchap?</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Fast, secure, and hassle-free loans tailored for Kenyans. Get the
            funds you need without the stress.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: <Bolt size={28} className="text-blue-600" />,
              title: "5-Minute Approval",
              description: "Get approved in minutes, not days.",
            },
            {
              icon: <FileText size={28} className="text-blue-600" />,
              title: "No Paperwork",
              description: "100% digital process. No documents needed.",
            },
            {
              icon: <ShieldCheck size={28} className="text-blue-600" />,
              title: "Bank-Level Security",
              description: "Your data is encrypted and secure.",
            },
            {
              icon: <Smartphone size={28} className="text-blue-600" />,
              title: "M-Pesa Instant Pay",
              description: "Pay and receive funds via M-Pesa instantly.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={staggerItem}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            >
              What Our <span className="text-emerald-600">Customers Say</span>
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Real experiences from satisfied customers across Kenya.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex justify-center mb-6">
              <img
                src={testimonials[index]?.img}
                alt={testimonials[index]?.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-xl ring-4 ring-emerald-200"
                onError={(e) => {
                  e.target.src = "/images/default-avatar.jpg";
                }}
              />
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < 5 ? "text-emerald-500" : "text-gray-300"
                    }`}
                    fill={i < 5 ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <p className="text-gray-700 italic text-lg mb-6">
                "{testimonials[index]?.text}"
              </p>

              <h4 className="font-bold text-emerald-600 text-xl">
                {testimonials[index]?.name}
              </h4>
              <p className="text-sm text-gray-500 mt-2">
                {testimonials[index]?.location} • Borrowed{" "}
                <span className="font-semibold text-emerald-600">
                  KES {testimonials[index]?.amount?.toLocaleString()}
                </span>
              </p>

              <span className="inline-block mt-4 text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                ✔ Verified Customer
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== TRUST SECTION ==================== */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Trusted & <span className="text-blue-600">Secure</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto mb-10"
          >
            Your safety is our priority. We are fully licensed and regulated to
            provide financial services in Kenya.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {[
              { icon: <ShieldCheck size={18} />, text: "SSL Secured" },
              { icon: <Users size={18} />, text: "CBK Licensed" },
              { icon: <Clock size={18} />, text: "24/7 Support" },
              { icon: <TrendingUp size={18} />, text: "Verified Service" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 px-6 py-3 rounded-full shadow-sm flex items-center gap-2 border border-gray-100"
              >
                <span className="text-emerald-500">{item.icon}</span>
                <span className="font-medium text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500"
          >
            Trusted by over <span className="font-bold text-blue-600">60,000+ Kenyans</span>
          </motion.p>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of Kenyans who have already benefited from our fast
            and reliable loan services.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/eligibility")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2 text-lg"
          >
            <span>Apply Now</span>
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 text-white text-center p-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/70"
        >
          © {new Date().getFullYear()} Mkopo Chapchap. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
}