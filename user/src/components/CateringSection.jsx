import React from "react";
import { ChefHat, Calendar, Users, Briefcase } from "lucide-react";
import {BiFoodMenu} from "react-icons/bi";

// --- CateringSection Component ---
const CateringSection = () => {
  return (
    <section className="relative w-full h-auto py-8 md:py-8 overflow-hidden">
      {/* 🔹 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        {/* ⚠️ Replace with your downloaded video path */}
        <source src="/videos/cater.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔹 Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* 🔹 Content Section */}
      <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Heading */}
        <h1 className="flex items-center gap-3 justify-center text-4xl sm:text-5xl md:text-5xl font-bold mb-4">
          {/* <ChefHat className="w-10 h-10 text-[var(--primary)] hidden sm:block" /> */}
         
            Cater Your Next Event with Aadhi Jevan
       
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-lg sm:text-xl text-gray-100/90 max-w-3xl mx-auto leading-relaxed">
          Take the authentic taste of Aadhi Jevan to your special occasions,
          corporate meetings, and private parties. We handle the meal so you can
          focus on your guests.
        </p>

        {/* --- Key Catering Features Grid --- */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Custom Menus */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-[var(--primary)]/20 transition duration-300 hover:scale-[1.03]">
            <BiFoodMenu className="w-12 h-12 mx-auto text-[var(--primary)]" />
            <h3 className="mt-5 text-2xl font-bold text-white">
              Fully Custom Menus
            </h3>
            <p className="mt-3 text-gray-100/90">
              Whether it's a small gathering or a grand affair, we design a menu
              tailored exactly to your preferences, budget, and dietary needs.
            </p>
          </div>

          {/* Feature 2: Event Sizes */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-[var(--primary)]/20 transition duration-300 hover:scale-[1.03]">
            <Users className="w-12 h-12 mx-auto text-[var(--primary)]" />
            <h3 className="mt-5 text-2xl font-bold text-white">
              All Event Sizes
            </h3>
            <p className="mt-3 text-gray-100/90">
              We cater for events from 20 to 500+ guests, including Weddings,
              Birthdays, Anniversaries, and large Community Gatherings.
            </p>
          </div>

          {/* Feature 3: Corporate Focus */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-[var(--primary)]/20 transition duration-300 hover:scale-[1.03]">
            <Briefcase className="w-12 h-12 mx-auto text-[var(--primary)]" />
            <h3 className="mt-5 text-2xl font-bold text-white ">
              Corporate & Business Catering
            </h3>
            <p className="mt-3 text-gray-100/90">
              Impress your clients and motivate your team with fresh, hot, and
              hygienic meals for your Board Meetings, Conferences, or Office
              Lunches.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CateringSection;
