import React, { useEffect, useRef } from 'react';

const ClientLogo = () => {
  const scrollRefTop = useRef(null);
  const scrollRefBottom = useRef(null);

  const logos = [
    { id: 1, name: "Airtel", url: "/logos/airtel.png" },
    { id: 2, name: "Abzooba", url: "/logos/abzooba.avif" },
    { id: 3, name: "Nexa", url: "/logos/nexa.png" },
    { id: 4, name: "Ddl group", url: "/logos/ddn.jpeg" },
    { id: 5, name: "HDFC", url: "/logos/hdfc.png" },
    { id: 6, name: "Zolo", url: "/logos/zolo.png" },
    { id: 7, name: "Union Bank", url: "/logos/union-bank.png" },
    { id: 8, name: "SBI", url: "/logos/sbi.png" },
    { id: 9, name: "Mahindra", url: "/logos/mahindra.png" },
    { id: 10, name: "Maruti Suzuki", url: "/logos/maruti_suzuki.png" },
    { id: 11, name: "Centrio Group", url: "/logos/centrio.jpeg" },
    { id: 12, name: "Crazy Momos", url: "/logos/crazy_momos.png" },
    { id: 13, name: "Excella", url: "/logos/excella.jpeg" },
    { id: 14, name: "Raja_software_lab", url: "/logos/raja_software_lab.jpeg" },
    { id: 15, name: "venky's", url: "/logos/venky's.jpeg" },

  ];

  // Duplicate logos for smooth infinite scrolling
  const duplicatedLogos = [...logos, ...logos];

  // Function to handle scrolling
  const useAutoScroll = (ref, speed = 0.5, reverse = false) => {
    useEffect(() => {
      const container = ref.current;
      if (!container) return;

      let scrollPos = reverse ? container.scrollWidth / 2 : 0;
      let animationFrameId;

      const scroll = () => {
        scrollPos += reverse ? -speed : speed;
        if (scrollPos >= container.scrollWidth / 2) scrollPos = 0;
        if (scrollPos <= 0 && reverse) scrollPos = container.scrollWidth / 2;
        container.scrollLeft = scrollPos;
        animationFrameId = requestAnimationFrame(scroll);
      };

      animationFrameId = requestAnimationFrame(scroll);

      const handleMouseEnter = () => cancelAnimationFrame(animationFrameId);
      const handleMouseLeave = () => animationFrameId = requestAnimationFrame(scroll);

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [ref, speed, reverse]);
  };

  useAutoScroll(scrollRefTop, 0.8, false);
  useAutoScroll(scrollRefBottom, 0.8, true);

  return (
    <div className="w-full bg-[#1E1E1E] py-6 md:py-8 ">
      {/* Header Section */}
      <div className="text-center mb-16 px-4">
        <p className="text-white text-xs md:text-sm tracking-widest uppercase mb-3 font-medium">
          OUR CLIENTS
        </p>
        
         <h1
            className="text-3xl sm:text-5xl font-bold text-[#F5F5F5]"
            style={{ color: "var(--secondary)" }}
          >
           Trusted Nutrition Partners for Leading Companies
          </h1>
        {/* <p className="text-[#B5B5B5]  text-base sm:text-lg  mt-5 max-w-2xl mx-auto leading-relaxed">
          From ambitious start-ups to global enterprises, our partners trust us to
          deliver fresh, thoughtfully prepared meals that nurture employee health
          and well-being. Together, we’re building a healthier future at work.
        </p> */}
      </div>


      {/* Infinite Scroll Logos - Top Row */}
      <div className="relative overflow-hidden mb-8">
        <div
          ref={scrollRefTop}
          className="flex gap-8 md:gap-12 lg:gap-16 overflow-x-hidden items-center"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`top-${logo.id}-${index}`}
              className="flex-shrink-0  hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-16 md:h-20 lg:h-24 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Infinite Scroll Logos - Bottom Row */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollRefBottom}
          className="flex gap-8 md:gap-12 lg:gap-16 overflow-x-hidden items-center"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`bottom-${logo.id}-${index}`}
              className="flex-shrink-0  hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-16 md:h-20 lg:h-24 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientLogo;
