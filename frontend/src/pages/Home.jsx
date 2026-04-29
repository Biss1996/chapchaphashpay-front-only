import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-[Poppins]">

      {/* HERO */}
      <section className="bg-gradient-to-r from-sky-600 via-sky-500 to-green-500 text-white text-center py-24 px-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Instant <span className="text-green-300">M-Pesa</span> Loans
          </h1>

          <p className="mb-8 text-lg opacity-90">
            Fast approval. No paperwork. Money in minutes.
          </p>

          <button
            onClick={() => navigate("/eligibility")}
            className="bg-white text-sky-600 font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            Apply Now <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </section>

      {/* LIVE COUNTER */}
      <div className="max-w-xl mx-auto -mt-16 bg-white shadow-lg rounded-2xl p-6 text-center border border-gray-100">
        <h2 className="text-sm text-gray-500">🔥 Live Loan Approvals Today</h2>

        <p className="text-4xl font-extrabold text-sky-600 mt-2 animate-pulse">
          {count.toLocaleString()}
        </p>

        <p className="text-gray-500 text-sm mt-1">
          Loans successfully disbursed today
        </p>
      </div>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Why Choose Us?</h2>
        <p className="text-gray-500 mb-10">Fast, secure and simple loans</p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: "bolt", text: "5-Minute Approval" },
            { icon: "file-alt", text: "No Paperwork" },
            { icon: "shield-alt", text: "Bank-Level Security" },
            { icon: "mobile-alt", text: "M-Pesa Instant Pay" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition"
            >
              <i className={`fas fa-${item.icon} text-3xl text-sky-500 mb-3`}></i>
              <p className="font-semibold">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">What Our Users Say</h2>
        <p className="text-gray-500 mb-10">Real experiences from customers</p>

        <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-md transition-all duration-500">

          <img
            src={testimonials[index]?.img}
            alt={testimonials[index]?.name}
  className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto mb-4 object-cover shadow-xl ring-4 ring-sky-300"
            onError={(e) => {
              e.target.src = "/images/default-avatar.jpg";
            }}
          />

          <p className="text-gray-700 italic">
            "{testimonials[index]?.text}"
          </p>

          <h4 className="mt-4 font-bold text-sky-600">
            {testimonials[index]?.name}
          </h4>

          <p className="text-xs text-gray-500">
            {testimonials[index]?.location} • Borrowed {testimonials[index]?.amount}
          </p>

          <span className="inline-block mt-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            ✔ Verified Customer
          </span>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-gray-100 py-16 text-center">
        <h2 className="text-2xl font-bold">Trusted & Secure</h2>
        <p className="text-gray-500 mb-6">Your safety is our priority</p>

        <div className="flex flex-wrap justify-center gap-4">
          {["SSL Secured", "CBK Licensed", "Verified Service"].map((t, i) => (
            <div
              key={i}
              className="bg-white px-6 py-3 rounded-full shadow flex items-center gap-2 hover:scale-105 transition"
            >
              <i className="fas fa-check-circle text-green-500 animate-pulse"></i>
              {t}
            </div>
          ))}
        </div>

        <p className="text-gray-500 mt-6">
          Trusted by over 60,000 Kenyans
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white text-center p-10">
        © 2025 Mkopo Chapchap. All rights reserved.
      </footer>
    </div>
  );
}