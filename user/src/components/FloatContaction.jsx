import React from 'react';
import { FiPhoneCall } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";

function Float() {
  return (
    <>
      <div
        className="fixed bottom-4 right-4 flex flex-col gap-3 z-[9999]"
        style={{
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          right: 'calc(1rem + env(safe-area-inset-right))',
        }}
      >
        {/* Phone Call Button with Ring animation */}
        <a
          href="tel:+917020014774"
          className="bg-teal-600 p-3 rounded-full shadow-md hover:scale-110 transition"
        >
          <FiPhoneCall className="text-white text-2xl animate-ring" />
        </a>

        {/* WhatsApp Button with Pop animation */}
        <a
          href="https://wa.me/917020014774"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 p-3 rounded-full shadow-md hover:scale-110 transition"
        >
          <BsWhatsapp className="text-white text-2xl animate-pop" />
        </a>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes ring {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        .animate-ring {
          animation: ring 1s ease-in-out infinite;
        }

        .animate-pop {
          animation: pop 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default Float;