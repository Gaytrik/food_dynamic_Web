import React, { useState } from "react";
import API from "../api/axiosInstance";
import AuthPage from "./AuthPage";

const ResetPasswordForm = () => {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await API.post("/reset-password", {
        email: form.email,
        password: form.password,
      });
      setMsg("Password reset successfully!");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch {
      setError("Failed to reset password.");
    }
  };

  return (
    <AuthPage>
      <h2 className="text-2xl text-center text-white font-bold mb-4">
        Set New Password 🔐
      </h2>
      {msg && <p className="text-green-400 text-center mb-3">{msg}</p>}
      {error && <p className="text-red-400 text-center mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-white">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm text-white">New Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm text-white">Confirm Password</label>
          <input
            type="password"
            name="confirm"
            required
            value={form.confirm}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-border-[var-(--primary)] text-white py-2 rounded-lg hover:bg-border-[var-(--primary)]"
        >
          Reset Password
        </button>
      </form>
    </AuthPage>
  );
};

export default ResetPasswordForm;
