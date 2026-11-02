
// DialogBox.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const DialogBox = ({ isOpen, onClose, type = "login", customMessage, customTitle, onConfirm }) => {
  // treat these as error types
  const isError = ["loginError", "passwordResetError", "contactError", "reviewError", "validationError", "notLoggedIn"].includes(type);

  useEffect(() => {
    if (!isOpen) return;

    let timer = null;

    // Auto-close for known types (extended to include review types & validation)
    if (
      [
        "login",
        "register",
        "passwordReset",
        "cartSuccess",
        "loginError",
        "passwordResetError",
        "contactSuccess",
        "contactError",
        "reviewSuccess",
        "reviewDeleted",
        "reviewError",
        "validationError",
        "notLoggedIn"
      ].includes(type)
    ) {
      timer = setTimeout(() => {
        onClose();
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [isOpen, type, onClose]);

  const getMessage = () => {
    // If a customMessage was passed, prefer it
    if (customMessage) return customMessage;

    switch (type) {
      case "passwordResetError":
        return "Failed to reset password. Invalid OTP or expired. Please try again.";
      case "passwordReset":
        return "Your password has been reset successfully. Click continue to log in.";
      case "cartSuccess":
        return "Product successfully added to your shopping cart.";
      case "register":
        return "Registration complete! You can now log in.";
      case "loginError":
        return "Invalid email or password. Please try again.";
      case "contactSuccess":
        return "✅ Message sent successfully! We'll get back to you soon.";
      case "contactError":
        return "❌ Failed to send message. Please try again.";
      case "reviewSuccess":
        return "✅ Review added! It will appear after approval.";
      case "reviewDeleted":
        return "🗑️ Review deleted!";
      case "reviewError":
        return "❌ Failed to save your review. Please try again.";
      case "validationError":
        return "Please fill required fields.";
      case "notLoggedIn":
        return "Please login to post a review.";
      case "login":
      default:
        return "Login successful! Welcome back.";
    }
  };

  const getTitle = () => {
    if (customTitle) return customTitle;
    return isError ? "Failed!" : "Success!";
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 180, damping: 12 },
            }}
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.1 } }}
          >
            <div
              className={`bg-white p-10 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 
                  ${isError ? "border-red-500" : "border-green-500"} transform transition duration-300 hover:shadow-3xl`}
            >
              <motion.div
                className="flex justify-center mb-6"
                variants={pulseVariants}
                initial="initial"
                animate="animate"
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ring-4
                    ${isError ? "bg-red-50 ring-red-200" : "bg-green-50 ring-green-200"}`}
                >
                  <CheckCircle
                    size={48}
                    className={`${isError ? "text-red-500" : "text-green-500"} drop-shadow-lg`}
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>

              <h2 className={`text-3xl font-bold mb-2 ${isError ? "text-red-600" : "text-gray-900"}`}>
                {getTitle()}
              </h2>

              <motion.p className="text-gray-600 text-md mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
                {getMessage()}
              </motion.p>

              {type === "passwordReset" && (
                <motion.button
                  onClick={onClose}
                  className="mt-4 w-full py-3 px-6 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  CONTINUE TO LOGIN
                </motion.button>
              )}
              {type === "confirmDelete" && (
  <motion.div
    className="flex justify-center gap-4 mt-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <button
      onClick={onClose}
      className="px-5 py-2 rounded-lg font-semibold border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
    >
      Cancel
    </button>
    <button
      onClick={() => {
        if (typeof onConfirm === "function") onConfirm();
      }}
      className="px-5 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
    >
      Delete
    </button>
  </motion.div>
)}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DialogBox;

