import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const slides = [
    { id: 1, img: "/Images/food5.jpg" },
    { id: 2, img: "/Images/food6.jpg" },
    { id: 3, img: "/Images/food7.jpg" },
    { id: 4, img: "/Images/food.jpg" },
    { id: 5, img: "/Images/food8.jpg" },
    { id: 6, img: "/Images/foode9.jpg" },
    { id: 7, img: "/Images/food9.jpg" },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <main className="relative w-full h-[70vh] sm:h-[80vh] md:h-screen overflow-hidden bg-[var(--secondary)] text-[var(--accent)]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.img}
            alt="Aadhijevan Hotel"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-[3000ms]"
          />

          {/* Blackish Overlay */}
          <div className="absolute inset-0 bg-black/50 bg-opacity-60"></div>

          {/* Text Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 md:px-10 lg:px-20">
            <h1 className=" text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold drop-shadow-lg tracking-wide">
              Aadhi Jevan
            </h1>
            <p className="mt-3 sm:mt-4 max-w-xs sm:max-w-md md:max-w-2xl text-xs sm:text-sm md:text-lg opacity-90 leading-relaxed px-2">
              Experience the taste of tradition and luxury dining at Aadhi Jevan where every flavor tells a story.
            </p>
            <Link to="/menu">
            <button className="mt-5 sm:mt-8 bg-[var(--primary)] text-[var(--secondary,#000)] font-semibold px-6 sm:px-8 md:px-10 py-2 sm:py-3 shadow-lg hover:scale-105 transform transition duration-300 ">
              Explore Menu
            </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 sm:space-x-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition ${
              i === current
                ? "bg-white ring-2 ring-white ring-offset-1 sm:ring-offset-2"
                : "bg-white bg-opacity-50 hover:bg-opacity-100"
            }`}
          ></button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/60 sm:bg-black/70 text-white p-1 sm:p-2 md:p-3 rounded-full shadow-md hover:scale-110 transition"
      >
        <ChevronLeft size={18} className="sm:hidden" />
        <ChevronLeft size={22} className="hidden sm:block" strokeWidth={2.5} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/60 sm:bg-black/70 text-white p-1 sm:p-2 md:p-3 rounded-full shadow-md hover:scale-110 transition"
      >
        <ChevronRight size={18} className="sm:hidden" />
        <ChevronRight size={22} className="hidden sm:block" strokeWidth={2.5} />
      </button>
    </main>
  );
};

export default HeroSection;





// import React from "react";
// import { Search, User } from "lucide-react";
// import { useNavigate } from "react-router-dom";


// const HeroSection = () => {

//   const navigate = useNavigate();

//   const handleOrderNow = () => {
//     navigate("/menu"); 
//   };
//   return (
//     <div
//       className="relative min-h-screen flex flex-col justify-between text-white font-[Urbanist]"
//       style={{
//         backgroundImage: "url('/Images/LandingPage.png')", // change this to your local image
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Overlay Blur for Depth */}
//       <div className="absolute inset-0 bg-black/50 "></div>

//       {/* 🔹 Header */}
//       <header className="relative z-10 flex items-center justify-between px-10 py-6">
//         {/* Logo */}
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-[var(--highlight,#CFFF4D)] rounded-full flex items-center justify-center">
//             <span className="text-black font-bold text-lg">🌿</span>
//           </div>
//           <span className="text-[var(--highlight,#CFFF4D)] font-bold text-lg tracking-widest">
//             HEALTHY FOOD
//           </span>
//         </div>

//         {/* Nav Menu */}
        
//       </header>

//       {/* 🔹 Hero Content */}
//       <main className="relative z-10 flex flex-col items-start justify-center px-10 py-20 max-w-2xl">
//         <h1 className="text-5xl font-extrabold mb-2">HEALTHY FOOD</h1>
//         <h2 className="text-4xl font-bold text-[var(--highlight,#CFFF4D)] mb-4">
//           DELICIOUS!
//         </h2>
//         <p className="text-xl mb-8 font-medium">
//           prepare and serve with love
//         </p>
//        <p className="text-sm text-gray-200 leading-relaxed mb-10 max-w-md">
//   Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
//   tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim.
// </p>

//         <button
//       onClick={handleOrderNow}
//       className="border-2 border-[var(--highlight,#CFFF4D)] text-[var(--highlight,#CFFF4D)] rounded-full px-10 py-3 font-semibold text-lg hover:bg-[var(--highlight,#CFFF4D)] hover:text-black transition duration-300"
//     >
//       order now
//     </button>
//       </main>

//       {/* 🔹 Footer Social Icons */}
//       <footer className="relative z-10 flex justify-end px-10 pb-6">
//         <div className="flex gap-4 text-[var(--highlight,#CFFF4D)] text-lg">
//           <i className="fab fa-instagram"></i>
//           <i className="fab fa-facebook-f"></i>
//           <i className="fab fa-twitter"></i>
//           <i className="fab fa-whatsapp"></i>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default HeroSection;


