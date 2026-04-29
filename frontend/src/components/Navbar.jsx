import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl">
            <i className="fas fa-bolt text-sky-500 text-2xl"></i>
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Tala HashPay Loans
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { to: "/", label: "Home" },
              { to: "/apply", label: "Apply" },
              { to: "/eligibility", label: "Eligibility" },
              { to: "/dashboard", label: "Dashboard" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-sky-600"
                      : "text-gray-600 hover:text-sky-500"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              to="/apply"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile button (optional future menu) */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg border border-gray-200">
              <i className="fas fa-bars"></i>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}