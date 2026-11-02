import React from "react";
import heroBg from "/Images/snacksbanner.jpg";
import { useNavigate } from "react-router-dom";

const OrderBanner = () => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate("/menu");
  };

  return (
    <section
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-cover bg-center flex items-center justify-center md:justify-start"
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-10 md:px-20 text-white max-w-2xl text-center md:text-left md:ml-20">
        {/* Tagline */}
        <p className="uppercase tracking-widest text-xs sm:text-sm md:text-base text-[var(--primary,#FFB100)] mb-3">
          Fresh • Fast • Flavorful
        </p>

        {/* Main Title */}
       
         <h1
            className="text-3xl sm:text-5xl md:text-5xl font-semibold mb-4"
            style={{ color: "var(--Secondary)" }}
          >
           The Fastest Delivery Food
          </h1>

        {/* Supporting Description */}
        <p className="text-xs sm:text-sm md:text-base text-gray-200 mb-6 leading-relaxed">
          Craving something delicious? Get your favorite meals delivered hot and fresh,
          straight from our kitchen to your door anytime, anywhere.
        </p>

        {/* Button */}
        <button
          onClick={handleOrderNow}
          className="mt-2 sm:mt-4 bg-[var(--primary)] text-[var(--secondary,#000)] font-medium px-5 sm:px-6 py-2 sm:py-3 shadow-lg hover:scale-105 transition-all duration-300"
        >
          Order Now
        </button>
      </div>
    </section>
  );
};

export default OrderBanner;
