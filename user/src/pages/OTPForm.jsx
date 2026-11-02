import React, { useState } from "react";
import API from "../api/axiosInstance";
import AuthPage from "./AuthPage";

const OTPForm = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/verify-otp", { email, otp });
      window.location.href = "/reset-password";
    } catch {
      setError("Invalid OTP or expired. Try again.");
    }
  };

  return (
    <AuthPage>
      <h2 className="text-2xl text-center text-white font-bold mb-4">
        Verify OTP
      </h2>
      {error && <p className="text-red-400 text-center mb-3">{error}</p>}
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-sm text-white">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-white">Enter OTP</label>
          <input
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-border-[var-(--primary)] text-white py-2 rounded-lg hover:bg-border-[var-(--primary)]"
        >
          Verify OTP
        </button>
      </form>
    </AuthPage>
  );
};

export default OTPForm;
