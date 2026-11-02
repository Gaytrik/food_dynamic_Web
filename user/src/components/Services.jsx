import React from "react";
import {
  FaUtensils,
  FaSeedling,
  FaGlassCheers,
  FaBirthdayCake,
  FaConciergeBell,
  FaTruck,
} from "react-icons/fa";
import { GiFruitBowl, GiFoodTruck, GiMeal } from "react-icons/gi";
import { BiFoodMenu } from "react-icons/bi";

const services = [
  {
    icon: <GiMeal className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "Customized Tiffin Box",
    desc: "Nutritious and delicious daily meals tailored to your preference, freshly packed and delivered right on time.",
  },
  {
    icon: <GiFruitBowl className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "Fruit & Snack Platters",
    desc: "Beautifully arranged seasonal fruits and snacks for your corporate events or daily wellness programs.",
  },
  {
    icon: <FaGlassCheers className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "Corporate Events Catering",
    desc: "From board meetings to grand celebrations we serve impeccable dishes that impress every guest.",
  },
  {
    icon: <FaBirthdayCake className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "Special Occasions",
    desc: "Celebrate milestones with our themed catering options perfect for birthdays, anniversaries, and festivals.",
  },
  {
    icon: <FaConciergeBell className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "On-Site Service",
    desc: "Professional staff available for on-site meal setup, service, and cleanup for a seamless dining experience.",
  },
  {
    icon: <GiFoodTruck className="text-2xl sm:text-3xl text-[var(--primary)]" />,
    title: "Pantry & Bulk Deliveries",
    desc: "Efficient large-order catering and pantry management solutions for businesses of all scales.",
  },
];

const Services = () => {
  return (
    <section className="bg-[var(--secondary)] text-[var(--accent)] py-12 px-5 sm:px-8 lg:px-8 relative overflow-hidden">
      {/* Decorative Overlay */}
      <div className="absolute max-w-full inset-0 pointer-events-none"></div>

      <div className="relative max-w-full mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <header className="text-center mb-6 relative">
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
              <span className="mb-4 md:mb-0 text-5xl sm:text-[1rem] md:text-[3rem] lg:text-[6rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                Services
              </span>
            </div>

            <h1
              className="text-3xl sm:text-5xl font-extrabold text-center mb-2"
              style={{ color: "var(--accent)" }}
            >
              Our Services
            </h1>
          </header>
          <p className="max-w-2xl mx-auto text-[var(--accent)]/70 text-sm sm:text-base leading-relaxed">
            We offer a wide range of catering solutions that bring comfort,
            freshness, and excellence to your table every single day.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white pt-5 sm:pt-6 px-5 sm:px-6 rounded-md shadow-md border border-[var(--gray)]/20 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-500 
              min-h-[160px] sm:h-[200px] flex flex-col justify-start"
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-all duration-300">
                  {service.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-semibold text-center text-[var(--accent)] group-hover:text-[var(--primary)] transition-all duration-300 mb-1">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-center text-[var(--accent)]/70 text-xs sm:text-sm leading-relaxed line-clamp-none sm:line-clamp-4">
                {service.desc}
              </p>

              {/* Accent Line */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[var(--primary)] rounded-full group-hover:w-16 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
