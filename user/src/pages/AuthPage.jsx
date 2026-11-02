// src/pages/AuthPage.jsx
import React from "react";
import foodBg from "/public/Images/loginn.jpg";

const AuthPage = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full font-display">
      {/* Background Image */}
      <img
        src={foodBg}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Centered Form Area */}
      <div className="relative flex items-center justify-center min-h-screen px-4 md:px-8">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
