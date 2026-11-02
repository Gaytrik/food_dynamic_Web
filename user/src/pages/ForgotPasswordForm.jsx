import React, { useState } from "react";
import API from "../api/axiosInstance";
import AuthPage from "./AuthPage";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await API.post("/forgot-password", { email });
      setMessage("OTP sent to your email!");
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    }
  };

  return (
    <AuthPage>
      <h2 className="text-2xl text-center text-white font-bold mb-4">
        Forgot Password 🔑
      </h2>
      {message && <p className="text-green-400 text-center mb-3">{message}</p>}
      {error && <p className="text-red-400 text-center mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-border-[var-(--primary)] text-white py-2 rounded-lg hover:bg-border-[var-(--primary)]"
        >
          Send OTP
        </button>
      </form>
    </AuthPage>
  );
};

export default ForgotPasswordForm;
