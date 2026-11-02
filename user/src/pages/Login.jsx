// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import foodBg from "/Images/foode9.jpg";
import DialogBox from "../components/DialogBox";

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "login",
    title: "",
    message: "",
  });

  // OTP resend countdown
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

  const showDialog = (type, title, message) => {
    setDialog({ isOpen: true, type, title, message });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const decodeJwtPayload = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // ✅ LOGIN
  // ✅ FIXED LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/api/auth/login", null, {
       params: { email: email.toLowerCase(), password },

      });

      // Accept either plain token or object-based token response
      let token = res.data;

      if (typeof token === "object") {
        token = token.token || token.jwt || token.accessToken || token.data || null;
      }

      if (!token || typeof token !== "string" || token.split(".").length !== 3) {
        throw new Error("Invalid email or password");
      }

      // Save token and set default auth header
      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Decode JWT (optional)
      const decoded = decodeJwtPayload(token);
      const userEmail = decoded?.sub || decoded?.email || email;
      if (userEmail) localStorage.setItem("email", userEmail);

      // Fetch user ID
      try {
        const userRes = await API.get(`/api/auth/user?email=${encodeURIComponent(userEmail.toLowerCase())}`);
        const userData = userRes.data;
        const userId = userData?.id || userData?._id?.$oid || userData?._id;
        if (userId) localStorage.setItem("userId", userId);
      } catch (err) {
        console.error("User fetch failed:", err);
      }

      // ✅ Show dialog and redirect
      showDialog("login", "Success!", "Welcome back!");
      setTimeout(() => {
        closeDialog();
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Login failed:", err);
      showDialog("loginError", "Login Failed", "Invalid email or password.");
      setTimeout(() => closeDialog(), 1500);
    } finally {
      setLoading(false);
    }
  };


  // ✅ SEND OTP
  // ✅ SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCheck = await API.get(`/api/auth/user`, { params: { email } });
      if (!userCheck.data || Object.keys(userCheck.data).length === 0) {
        showDialog("contactError", "Error", "No account found with this email.");
        setTimeout(() => closeDialog(), 1500);
        setLoading(false);
        return;
      }

      const res = await API.post("/api/auth/send-otp", null, {
       params: { email: email.toLowerCase(), purpose: "RESET_PASSWORD" }
,
      });

      if (res.data && res.data.length > 10) {
        setTokenId(res.data);
        showDialog("contactSuccess", "OTP Sent", "Check your email for the OTP.");
        // ✅ Close the dialog and switch to OTP step
        setTimeout(() => {
          closeDialog();
          setStep("otp");
        }, 1500);
      } else {
        showDialog("contactError", "Error", "Failed to send OTP. Try again later.");
        setTimeout(() => closeDialog(), 1500);
      }
    } catch (err) {
      console.error("Send OTP failed:", err);
      showDialog("contactError", "Error", "Something went wrong while sending OTP.");
      setTimeout(() => closeDialog(), 1500);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await API.post("/api/auth/send-otp", null, {
        params: { email: email.toLowerCase(), purpose: "RESET_PASSWORD" },
      });

      if (res.data && res.data.length > 10) {
        setTokenId(res.data);
        setResendTimer(60);
        showDialog("contactSuccess", "OTP Resent", "A new OTP has been sent to your email.");
        setTimeout(() => closeDialog(), 1500);
      } else {
        showDialog("contactError", "Error", "Failed to resend OTP.");
        setTimeout(() => closeDialog(), 1500);
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      showDialog("contactError", "Error", "Something went wrong while resending OTP.");
      setTimeout(() => closeDialog(), 1500);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 VERIFY OTP & RESET PASSWORD
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showDialog("validationError", "Password Mismatch", "Passwords do not match.");
      setTimeout(() => closeDialog(), 4000);
      return;
    }

    if (newPassword.length < 6) {
      showDialog("validationError", "Weak Password", "Password must be at least 6 characters long.");
      setTimeout(() => closeDialog(), 4000);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/auth/verify-otp", null, {
        params: {
         userEmail: email.toLowerCase(),

          tokenId,
          otp,
          purpose: "RESET_PASSWORD",
          value: newPassword,
        },
      });

      if (res.data?.toLowerCase().includes("success")) {
        showDialog("passwordReset", "Password Reset", "Your password has been reset successfully.");
        // ✅ Reset UI after dialog closes
        setTimeout(() => {
          closeDialog();
          setStep("login");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1500);
      } else {
        showDialog("passwordResetError", "Reset Failed", "Invalid or expired OTP.");
        setTimeout(() => closeDialog(), 3000);
      }
    } catch (err) {
      console.error("Verify OTP failed:", err);
      showDialog("passwordResetError", "Reset Failed", "Password reset failed. Please try again.");
      setTimeout(() => closeDialog(), 3000);
    } finally {
      setLoading(false);
    }
  };

  const Button = ({ label }) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[var(--primary)] text-[var(--secondary)] rounded-lg py-2 font-semibold uppercase hover:text-white  transition-all flex items-center justify-center gap-2 shadow-md"
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : label}
    </button>
  );

  return (
    <div className="relative min-h-screen w-full font-sans">
      {/* Background */}
      <img src={foodBg} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5">
        <div className="w-full max-w-lg backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-[var(--secondary)]/20">
          <h2 className="text-3xl font-bold text-center text-[var(--secondary)] mb-5 tracking-wide uppercase">
            {step === "login" && "Welcome Back"}
            {step === "forgot" && "Forgot Password"}
            {step === "otp" && "Reset Password"}
          </h2>

          {/* LOGIN */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--secondary)]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-[var(--secondary)]">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("forgot")}
                  className="text-sm text-white hover:text-[var(--primary)] transition"
                >
                  Forgot Password?
                </button>
              </div>

              <Button label="Sign In" />

              <p className="text-center text-sm text-[var(--secondary)]/70 mt-3">
                Don’t have an account?{" "}
                <a
                  href="/register"
                  className="font-semibold text-[var(--highlight)] hover:text-[var(--primary)] transition"
                >
                  Register
                </a>
              </p>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {step === "forgot" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--secondary)]">
                  Enter your registered email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>

              <Button label="Send OTP" />
              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-sm text-[var(--highlight)] hover:text-[var(--primary)] transition"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* OTP + RESET PASSWORD */}
          {/* OTP + RESET PASSWORD */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--secondary)]">
                  Enter OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 
                   text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>

              {/* New Password Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-[var(--secondary)]">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 
                   text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-[38px] text-gray-700 hover:text-[var(--primary)] transition"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-[var(--secondary)]">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 
                   text-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-gray-700 hover:text-[var(--primary)] transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[var(--primary)] text-[var(--secondary)] rounded-lg py-2 font-semibold uppercase 
      hover:text-white transition-all flex items-center justify-center gap-2 shadow-md 
      focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-70`}
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Reset Password"}
              </button>

              <div className="text-center text-[var(--secondary)] text-sm mt-2">
                ⏳ OTP expires in 10 minutes.
              </div>

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
                    className="text-sm text-[var(--highlight)] hover:text-[var(--primary)] transition disabled:opacity-70"
                  >
                    🔁 Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

        </div>
      </div>

      {/* DialogBox */}
      <DialogBox
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        customTitle={dialog.title}
        customMessage={dialog.message}
      />
    </div>
  );
};

export default Login;
