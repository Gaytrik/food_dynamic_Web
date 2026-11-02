// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "./utils/auth";
import DialogBox from "../components/DialogBox";

const BASE_URL = "http://localhost:8080";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    autoClose: true,
    duration: 1500,
  });

  useEffect(() => {
    let timer;
    if (step === "otp" && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  useEffect(() => {
    if (step === "otp") setResendTimer(60);
  }, [step]);

  const showDialog = (type, title, message, options = {}) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      autoClose: options.autoClose ?? true,
      duration: options.duration ?? 1500,
    });
  };

  const closeDialog = () => setDialog((d) => ({ ...d, isOpen: false }));

  // ✅ LOGIN
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const normalizedEmail = email.trim().toLowerCase();

  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/api/auth/login?email=${encodeURIComponent(normalizedEmail)}&password=${encodeURIComponent(password)}`,
  //       { method: "POST" }
  //     );

  //     const resultText = await response.text();
  //     const isJwtToken = resultText && resultText.includes(".") && resultText.length > 20;

  //     if (!response.ok || !isJwtToken) throw new Error("Invalid credentials");

  //     saveAuth(resultText, normalizedEmail);

  //     const userRes = await fetch(`${BASE_URL}/api/auth/user?email=${encodeURIComponent(normalizedEmail)}`, {
  //       headers: { Authorization: `Bearer ${resultText}` },
  //     });
  //     if (!userRes.ok) throw new Error("Failed to get user info");

  //     const userData = await userRes.json();
  //     const role = userData?.role?.toUpperCase();

  //     if (role === "ADMIN") {
  //       showDialog("success", "Welcome Admin!", "Redirecting...", { duration: 1200 });
  //       setTimeout(() => navigate("/admindashboard"), 1200);
  //     } else {
  //       showDialog("error", "Access Denied", "Only admins can access this panel.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     showDialog("error", "Login Failed", err.message || "Email or password incorrect.");
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // };

  // ✅ SEND OTP
  // --- LOGIN ----------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/login?email=${encodeURIComponent(normalizedEmail)}&password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );
      const text = await response.text();

      // backend returns plain JWT or "Invalid email or password"
      const isJwt = text && text.includes(".") && text.length > 20;
      if (!isJwt) throw new Error("Invalid email or password");

      saveAuth(text, normalizedEmail);

      const info = await fetch(`${BASE_URL}/api/auth/user?email=${encodeURIComponent(normalizedEmail)}`);
      if (!info.ok) throw new Error("User lookup failed");
      const user = await info.json();
      const role = user?.role?.toUpperCase();

      if (role === "ADMIN") {
        showDialog("success", "Welcome Admin!", "Redirecting...", { duration: 1000 });
        setTimeout(() => navigate("/analytics"), 1000);
      } else {
        showDialog("error", "Access Denied", "Only admins can log in.");
      }
    } catch (err) {
      console.error(err);
      showDialog("error", "Login Failed", err.message || "Email or password incorrect.");
    } finally {
      setLoading(false);
    }
  };

  // --- SEND OTP -------------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/send-otp?email=${encodeURIComponent(normalizedEmail)}&purpose=RESET_PASSWORD`,
        { method: "POST" }
      );
      const text = await res.text();

      // backend returns tokenId or "User not found"
      if (!res.ok || text.includes("User not found") || text.length < 10)
        throw new Error("User not found");

      setTokenId(text);
      showDialog("success", "OTP Sent", "Check your email for the OTP.", { duration: 1200 });
      setTimeout(() => {
        closeDialog();
        setStep("otp");
      }, 1200);
    } catch (err) {
      console.error(err);
      showDialog("error", "OTP Failed", err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY OTP -----------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    // basic client-side validation
    if (newPassword !== confirmPassword) {
      showDialog("warning", "Passwords do not match", "Please enter matching passwords.", { duration: 1200 });
      setTimeout(() => closeDialog(), 1200);
      return;
    }
    if (!newPassword || newPassword.trim().length < 6) {
      showDialog("warning", "Weak Password", "Password must be at least 6 characters.", { duration: 1200 });
      setTimeout(() => closeDialog(), 1200);
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/verify-otp?userEmail=${encodeURIComponent(normalizedEmail)}&tokenId=${encodeURIComponent(
          tokenId
        )}&otp=${encodeURIComponent(otp)}&purpose=RESET_PASSWORD&value=${encodeURIComponent(newPassword)}`,
        { method: "POST" }
      );

      const rawText = await res.text();
      const text = (rawText || "").trim();

      // Backend returns success messages containing "successfully"
      if (res.ok && text.toLowerCase().includes("successfully")) {
        showDialog("success", "Password Reset", "Your password has been reset successfully.", { duration: 1200 });

        // wait for dialog to close, then reset UI and fields
        setTimeout(() => {
          closeDialog();
          setStep("login");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1200);
      } else {
        // Show backend message (e.g. "Wrong OTP", "Expired OTP", etc.)
        showDialog("error", "Invalid OTP", text || "Invalid or expired OTP.", { duration: 1200 });
        setTimeout(() => {
          closeDialog();
        }, 1200);
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      showDialog("error", "Reset Failed", "Password reset failed. Try again.", { duration: 1200 });
      setTimeout(() => closeDialog(), 1200);
    } finally {
      setLoading(false);
    }
  };


  // --- RESEND OTP -----------------------------------------------------
  const handleResendOtp = async () => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/send-otp?email=${encodeURIComponent(normalizedEmail)}&purpose=RESET_PASSWORD`,
        { method: "POST" }
      );
      const text = await res.text();

      if (!res.ok || text.includes("User not found") || text.length < 10)
        throw new Error("User not found");

      setTokenId(text);
      setResendTimer(60);
      showDialog("success", "OTP Resent", "OTP resent successfully.", { duration: 1200 });
      setTimeout(() => closeDialog(), 1200);
    } catch (err) {
      console.error(err);
      showDialog("error", "Resend Failed", err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };


  const Button = ({ label }) => (
    <button
      type="submit"
      disabled={loading}
      className={`w-full bg-[var(--primary)] text-white rounded-lg py-2 font-semibold tracking-wide uppercase 
      hover:bg-[var(--primary)]/80 transition-all flex items-center justify-center gap-2 
      shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-70`}
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : label}
    </button>
  );

  return (
    <div className="relative min-h-screen w-full bg-[var(--secondary)] overflow-hidden">
      <img src={"/Images/AdminLogin2.jpg"} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[var(--accent)]/70 backdrop-blur-sm" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-5">
        <div className="w-full max-w-md bg-white/15 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/20 transition-transform hover:scale-[1.01] duration-200">
          <h2 className="text-3xl font-extrabold text-center text-white mb-6 tracking-wide uppercase drop-shadow-md">
            {step === "login" && "Admin Login"}
            {step === "forgot" && "Forgot Password"}
            {step === "otp" && "Reset Password"}
          </h2>

          {/* LOGIN */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-white mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none placeholder-gray-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-white mb-1">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none placeholder-gray-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-600 hover:text-[var(--primary)] transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("forgot")}
                  className="text-sm text-white hover:underline transition"
                >
                  Forgot Password?
                </button>
              </div>

              <Button label="Sign In" />
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {step === "forgot" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
              <Button label="Send OTP" />
              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-sm text-white hover:underline transition"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* OTP RESET */}
          {/* OTP RESET */}
{step === "otp" && (
  <form onSubmit={handleVerifyOtp} className="space-y-5">
    <input
      type="text"
      required
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      placeholder="Enter OTP"
      className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
    />

    {/* New Password with toggle */}
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New Password"
        className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-[10px] text-gray-600 hover:text-[var(--primary)] transition"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    {/* Confirm Password with toggle */}
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        className="w-full rounded-md bg-white/90 px-3 py-2 text-[var(--accent)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-[10px] text-gray-600 hover:text-[var(--primary)] transition"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    {/* Better responsive button */}
    <button
      type="submit"
      disabled={loading}
      className={`w-full bg-[var(--primary)] text-white rounded-lg py-2 font-semibold tracking-wide uppercase 
      hover:bg-[var(--primary)]/80 transition-all flex items-center justify-center gap-2 
      shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-70`}
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Reset Password"}
    </button>

    <div className="text-center text-white text-sm mt-3">⏳ OTP expires in 10 minutes.</div>

    <div className="text-center mt-2">
      {resendTimer > 0 ? (
        <p className="text-sm text-gray-300">
          Resend in <span className="font-semibold">{resendTimer}</span>s
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="text-sm text-white hover:underline transition disabled:opacity-70"
        >
          🔁 Resend OTP
        </button>
      )}
    </div>
  </form>
)}

        </div>
      </div>

      <DialogBox
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        autoClose={dialog.autoClose}
        duration={dialog.duration}
      />
    </div>
  );
};

export default Login;
