import React, { useEffect } from "react";

const ToastMessage = ({ show, message, type = "success", onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-[9999] animate-slideIn">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-black text-base font-semibold
        ${type === "success" ? "bg-[var(--primary)]" : "bg-red-600"}`}
      >
        {message}
      </div>

      <style>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn .35s ease-out; }
      `}</style>
    </div>
  );
};

export default ToastMessage;
