import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Trash2, Save, Edit3, CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// DialogBox Component (Inline)
const DialogBox = ({
  isOpen,
  onClose,
  onConfirm,
  type = "success",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  autoClose = true,
  duration = 1500,
}) => {
  const dialogRef = useRef(null);

  // Auto close logic (only for auto-close types)
  useEffect(() => {
    if (!isOpen || !autoClose || type === "confirm") return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [isOpen, autoClose, duration, onClose, type]);

  // Close when pressing ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Close on outside click
  const handleOutsideClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  const typeStyles = {
    success: {
      color: "green",
      icon: CheckCircle,
      gradient: "from-green-500 to-green-700",
      ring: "ring-green-300",
      bg: "bg-green-50",
      buttonGradient: "from-green-500 to-green-700",
    },
    error: {
      color: "red",
      icon: XCircle,
      gradient: "from-red-500 to-red-700",
      ring: "ring-red-300",
      bg: "bg-red-50",
      buttonGradient: "from-red-500 to-red-700",
    },
    info: {
      color: "blue",
      icon: Info,
      gradient: "from-blue-500 to-blue-700",
      ring: "ring-blue-300",
      bg: "bg-blue-50",
      buttonGradient: "from-blue-500 to-blue-700",
    },
    warning: {
      color: "yellow",
      icon: AlertTriangle,
      gradient: "from-yellow-400 to-yellow-600",
      ring: "ring-yellow-200",
      bg: "bg-yellow-50",
      buttonGradient: "from-yellow-500 to-yellow-700",
    },
    confirm: {
      color: "red",
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-700",
      ring: "ring-red-300",
      bg: "bg-red-50",
      buttonGradient: "from-red-500 to-red-700",
    },
  };

  const { color, icon: Icon, gradient, ring, bg, buttonGradient } =
    typeStyles[type] || typeStyles.success;

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Background */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={handleOutsideClick}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 120, damping: 12 },
            }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
          >
            <div
              ref={dialogRef}
              className="relative bg-gradient-to-br from-white to-gray-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-200"
            >
              {/* Close Button (for confirm dialogs) */}
              {type === "confirm" && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              )}

              {/* Icon Section */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center shadow-xl ring-4 ${ring}`}
                >
                  <Icon
                    size={44}
                    className={`text-${color}-600 drop-shadow-md`}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {title}
              </h2>

              {/* Message */}
              <div className="text-gray-700 mb-6 text-center leading-relaxed">
                {message}
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-4 ${type === "confirm" ? "" : "justify-center"}`}>
                {/* Cancel Button (for confirm dialogs) */}
                {type === "confirm" && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-300 text-gray-700 font-bold rounded-2xl shadow hover:bg-gray-400 transition-all duration-200"
                  >
                    {cancelText}
                  </button>
                )}

                {/* Confirm/OK Button */}
                <button
                  onClick={type === "confirm" ? handleConfirm : onClose}
                  className={`py-3 bg-gradient-to-r ${buttonGradient} text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all duration-200 ${
                    type === "confirm" ? "flex-1" : "px-8"
                  }`}
                >
                  {type === "confirm" ? confirmText : "OK"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main ProfilePage Component
export default function ProfilePage() {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: "info",
    title: "",
    message: "",
    autoClose: false,
  });

  const dummyAvatar =
    "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token");

        if (!email || !token) {
          showMessage("error", "Login Required", "Please login to access your profile", true);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const response = await axios.get("http://localhost:8080/api/auth/user", {
          params: { email },
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response.data.value || response.data;

        setUserData({
          fullName: user.name || "",
          email: user.email || "",
          address: user.address || "",
          phone: user.number || "",
        });
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        showMessage("error", "Profile Error", "Failed to fetch user profile", true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // ✅ Delete Confirmation Dialog (Image jaisa)
  const showDeleteConfirmation = () => {
    setDialogConfig({
      type: "confirm",
      title: "Delete Account?",
      message: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      confirmText: "Delete Account",
      cancelText: "Keep Account", 
      autoClose: false,
    });
    setDialogOpen(true);
  };

  // ✅ Success/Error Messages
  const showMessage = (type, title, message, autoClose = true, duration = 3000) => {
    setDialogConfig({
      type,
      title,
      message,
      autoClose,
      duration,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // ✅ Handle Confirm Action for Delete
  const handleDialogConfirm = () => {
    handleDeleteAccount();
  };

  const handleLogout = () => {
    localStorage.clear();
    showMessage("success", "Logged Out", "You have been logged out successfully!", true, 1500);
    setTimeout(() => {
      navigate("/");
      setTimeout(() => window.location.reload(), 300);
    }, 2000);
  };

  // ✅ Actual Delete Function
  const handleDeleteAccount = async () => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    try {
      const res = await axios.delete("http://localhost:8080/api/auth/delete", {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 200) {
        showMessage("success", "Account Deleted", "Your account has been deleted successfully!", true, 2000);
        
        setTimeout(() => {
          localStorage.clear();
          navigate("/");
          setTimeout(() => window.location.reload(), 300);
        }, 2500);
      }
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      showMessage("error", "Delete Failed", "Failed to delete account. Please try again.", true);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = userData.email;

      const payload = {
        name: userData.fullName,
        email: userData.email,
        address: userData.address,
        number: userData.phone,
      };

      const res = await axios.put("http://localhost:8080/api/auth/update", payload, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        showMessage("success", "Profile Updated", "Your profile has been updated successfully!", true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      showMessage("error", "Update Failed", "Failed to update profile. Please try again.", true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 sm:p-6 md:p-10 bg-[var(--secondary)] min-h-screen">
      {/* ---------- Sidebar ---------- */}
      <aside className="w-full md:w-72 bg-white rounded-3xl shadow-lg p-5 flex flex-col items-center border border-gray-100 justify-between">
        {/* Profile image + info */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-gray-100 shadow-md mb-3">
            <img 
              src={dummyAvatar} 
              alt="profile" 
              className="w-full h-full object-cover rounded-2xl" 
            />
          </div>

          <h2 className="text-lg font-semibold text-[var(--primary)] text-center">
            {userData.fullName || "User"}
          </h2>
          <p className="text-sm text-gray-500 mb-5 text-center break-all">
            {userData.email}
          </p>
        </div>

        {/* Buttons */}
        <nav className="w-full space-y-2 mt-6">
          <Link to="/orderhistory">
            <button className="w-full py-2 border text-[var(--accent)] rounded-xl font-medium hover:bg-gray-50 transition mb-3">
              Order History
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-[var(--primary)] text-white rounded-xl font-semibold shadow hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* ---------- Main Content ---------- */}
      <main className="flex-1 w-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--accent)] mb-6 sm:mb-8 text-center md:text-left">
          Profile
        </h1>

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-4 sm:p-6 md:p-8">
          <form className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-semibold mb-1 text-[var(--primary)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-lg text-base ${
                    isEditing
                      ? "border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      : "bg-gray-100 border-gray-200 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="flex-1">
                <label className="block font-semibold mb-1 text-[var(--primary)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-4 py-2.5 border rounded-lg text-base bg-gray-100 border-gray-200 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-semibold mb-1 text-[var(--primary)]">
                  Address
                </label>
                <input
                  type="text"
                  value={userData.address}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-lg text-base ${
                    isEditing
                      ? "border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      : "bg-gray-100 border-gray-200 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="flex-1">
                <label className="block font-semibold mb-1 text-[var(--primary)]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-lg text-base ${
                    isEditing
                      ? "border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      : "bg-gray-100 border-gray-200 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl font-semibold shadow hover:opacity-90 transition flex items-center gap-2"
                >
                  <Edit3 size={18} /> Update
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-[var(--optional-accent)] border border-black text-black rounded-xl font-semibold shadow hover:opacity-90 transition flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              )}

              <button
                type="button"
                onClick={showDeleteConfirmation}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl font-semibold shadow hover:bg-gray-900 transition flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete Account
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ✅ DialogBox Component (Now inline) */}
      <DialogBox
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        autoClose={dialogConfig.autoClose}
        duration={dialogConfig.duration || 1500}
      />
    </div>
  );
}