// src/components/DialogBox.jsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Reusable DialogBox
 * Props:
 * - isOpen (bool)
 * - onClose (fn)
 * - type: "success"|"error"|"info"|"warning"
 * - title (string)
 * - message (string)
 * - autoClose (bool) default true
 * - duration (ms) default 1500
 */
const DialogBox = ({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
  autoClose = true,
  duration = 1500,
}) => {
  const dialogRef = useRef(null);

  // ✅ Auto close logic
  useEffect(() => {
    if (!isOpen || !autoClose) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [isOpen, autoClose, duration, onClose]);

  // ✅ Close when pressing ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // ✅ Close on outside click
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
    },
    error: {
      color: "red",
      icon: XCircle,
      gradient: "from-red-500 to-red-700",
      ring: "ring-red-300",
      bg: "bg-red-50",
    },
    info: {
      color: "blue",
      icon: Info,
      gradient: "from-blue-500 to-blue-700",
      ring: "ring-blue-300",
      bg: "bg-blue-50",
    },
    warning: {
      color: "yellow",
      icon: AlertTriangle,
      gradient: "from-yellow-400 to-yellow-600",
      ring: "ring-yellow-200",
      bg: "bg-yellow-50",
    },
  };

  const { color, icon: Icon, gradient, ring, bg } =
    typeStyles[type] || typeStyles.success;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Background */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
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
              className="relative bg-gradient-to-br from-white to-gray-100 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-200"
            >
              {/* Animated Icon */}
              <motion.div
                className="flex justify-center mb-6"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <div
                  className={`w-24 h-24 rounded-full ${bg} flex items-center justify-center shadow-xl ring-4 ${ring}`}
                >
                  <Icon
                    size={56}
                    className={`text-${color}-600 drop-shadow-md`}
                    strokeWidth={2}
                  />
                </div>
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 drop-shadow-sm">
                {title || type.charAt(0).toUpperCase() + type.slice(1)}
              </h2>

              {/* Message */}
              <motion.p
                className="text-gray-700 text-lg mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {message || "Action completed successfully."}
              </motion.p>

              {/* OK button (for non-auto close modals) */}
              {!autoClose && (
                <button
                  onClick={onClose}
                  className={`mt-4 w-full py-3 bg-gradient-to-r ${gradient} text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all duration-200`}
                >
                  OK
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DialogBox;
