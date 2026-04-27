import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Apply from "./pages/Apply";
import Eligibility from "./pages/Eligibility";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";

import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eligibility" element={<Eligibility />} />

        <Route path="/apply" element={<Apply />} />

        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}