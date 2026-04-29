import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

export default function Success() {
  const alertShown = useRef(false);

  useEffect(() => {
    if (alertShown.current) return;
    alertShown.current = true;

    Swal.fire({
      title: "Payment Successful ✅",
      html: `
        <div style="text-align:center">
          <p>Your activation fee has been received successfully.</p>
          <br/>
          <strong>Your loan is now being processed.</strong>
          <br/><br/>
          You will receive confirmation within 
          <span style="color:#10b981">3 business days</span>.
          <br/><br/>
          Please keep your phone active for updates.
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Got it",
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Confirmed
        </h1>

        <p className="text-gray-600 mb-6">
          Your activation fee has been received successfully.
        </p>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            Your loan is now being processed. You will receive confirmation within{" "}
            <span className="font-bold text-green-600">
              3 business days
            </span>.
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>📱 Keep your phone active for updates</p>
          <p>🔒 All applications are securely reviewed</p>
          <p>⚡ No additional application needed</p>
        </div>
      </div>
    </div>
  );
}