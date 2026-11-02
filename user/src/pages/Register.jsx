import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import foodBg from "/Images/foode9.jpg";
import { Eye, EyeOff } from "lucide-react";
import DialogBox from "../components/DialogBox";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    gender: "Male",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
  });

  const showDialog = (type, title, message) => {
    setDialog({ isOpen: true, type, title, message });
  };

  const closeDialog = () => {
    setDialog((d) => ({ ...d, isOpen: false }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, number, password, gender, address } = formData;

    if (!name || !email || !number || !password || !gender || !address) {
      showDialog("validationError", "Missing Fields", "Please fill all required fields.");
      setTimeout(() => closeDialog(), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showDialog("validationError", "Invalid Email", "Please enter a valid email address.");
      setTimeout(() => closeDialog(), 3000);
      return;
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

    if (!strongPassword.test(password)) {
      showDialog(
        "validationError",
        "Weak Password",
        "Password must contain 1 uppercase, 1 lowercase, 1 number & 1 special character."
      );
      setTimeout(() => closeDialog(), 5000);
      return;
    }

    if (!/^[0-9]{10}$/.test(number)) {
      showDialog("validationError", "Invalid Phone", "Phone number must be 10 digits.");
      setTimeout(() => closeDialog(), 3000);
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/auth/register", {
        name,
        email,
        number,
        password,
        gender,
        address,
        role: "USER",
      });

      if (res.status === 200 || res.status === 201) {
        showDialog("register", "Success!", "Registration complete! Redirecting to login...");
        setTimeout(() => {
          closeDialog();
          navigate("/login");
        }, 1500);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.status === 409) {
        showDialog("contactError", "Email Exists", "This email is already registered. Try logging in instead.");
      } else if (error.response?.status === 400) {
        showDialog("validationError", "Invalid Email", "Please enter a valid email address.");
      } else {
        showDialog("contactError", "Registration Failed", "Something went wrong. Please try again.");
      }
      setTimeout(() => closeDialog(), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans">
      {/* Background */}
      <img src={foodBg} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5">
        <div className="w-full max-w-lg backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-[var(--secondary)]/20">
          <h2 className="text-3xl font-bold text-center text-[var(--secondary)] mb-5 tracking-wide uppercase">
            Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[var(--secondary)]">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9\s]*$/.test(value)) {
                    handleChange(e);
                  }
                }}
                placeholder="John Doe"
                className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
                focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[var(--secondary)]">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
                focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[var(--secondary)]">Phone</label>
              <div className="flex items-center mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
                focus-within:ring-2 focus-within:ring-[var(--primary)] outline-none">
                <span className="mr-2 text-[var(--accent)] select-none">+91</span>

                <input
                  type="text"
                  name="number"
                  required
                  value={formData.number}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, number: digitsOnly });
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 bg-transparent outline-none text-[var(--accent)] text-sm"
                  inputMode="numeric"
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 ml-2 text-[var(--accent)] opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3.75l3 3A2.25 2.25 0 016 8.25l-1.5 1.5a16.5 16.5 0 006.75 6.75L12.75 15a2.25 2.25 0 011.5-.75l3 3a2.25 2.25 0 01-.75 3.75A18.75 18.75 0 013.75 4.5a2.25 2.25 0 01-1.5-.75z"
                  />
                </svg>
              </div>
            </div>

            {/* Password */}
          {/* Password */}
<div className="relative">
  <label className="block text-sm font-semibold text-[var(--secondary)]">Password</label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      required
      value={formData.password}
      onChange={(e) => {
        handleChange(e);
        setPasswordError(""); // remove error while typing
      }}
      placeholder="••••••••"
      className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
      focus:ring-2 focus:ring-[var(--primary)] outline-none pr-10"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute inset-y-0 right-3 flex items-center justify-center text-[var(--accent)] hover:text-[var(--primary)] transition"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {/* show only after clicking register */}
  {passwordError && (
    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
  )}
</div>


            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-[var(--secondary)]">Gender</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
                  focus:ring-2 focus:ring-[var(--primary)] outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--secondary)]">Address</label>
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address..."
                className="mt-1 w-full rounded-md bg-[var(--secondary)]/90 px-3 py-2 text-[var(--accent)] text-sm 
                  focus:ring-2 focus:ring-[var(--primary)] outline-none"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--primary)] py-2 text-sm font-semibold text-[var(--secondary)] 
                  shadow-md hover:text-gray-100 transition-all"
              >
                {loading ? "Registering..." : "REGISTER"}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--secondary)]/70">
            Already a member?{" "}
            <a
              href="/login"
              className="font-semibold text-[var(--highlight)] hover:text-[var(--primary)] transition"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>

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

export default Register;
