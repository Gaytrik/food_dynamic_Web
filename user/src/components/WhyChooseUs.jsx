import React from "react";
import {
  Heart,
  UtensilsCrossed,
  ShieldCheck,
  Leaf,
  Building2,
  LineChart,
} from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <LineChart className="w-6 h-6 text-white" />,
      title: "The Productivity–Nutrition Link",
      desc: "Healthy employees are productive employees. A well-balanced diet directly enhances focus, reduces absenteeism, and elevates workplace performance.",
    },
    {
      icon: <Building2 className="w-6 h-6 text-white" />,
      title: "Professionally Planned Kitchen",
      desc: "Our state-of-the-art kitchen and trained chefs ensure world-class quality and hygiene, delivering tailored corporate meals that meet your exact needs.",
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Trusted Company",
      desc: "With over 1 million meals served, Aadhi Jevan stands as a trusted partner in delivering consistent quality and satisfaction to businesses of all sizes.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-white" />,
      title: "Nutrition & Variety",
      desc: "We create balanced, nutritionally rich menus offering diverse cuisines and cooking styles to keep meals exciting and nourishing every day.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: "Quality & Hygiene",
      desc: "Every dish is crafted with premium ingredients in a hygienic environment, adhering to international standards of food safety and excellence.",
    },
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-white" />,
      title: "Right Quantity, Every Time",
      desc: "Meal portions are precisely planned to match the energy needs of employees, ensuring optimal performance throughout their workday.",
    },
  ];

 
  const videoSource = "/chef.mp4"; 

  return (
    <section 
      className="w-full py-20 px-4 sm:px-8 lg:px-16 relative overflow-hidden text-white min-h-[500px]"
    >
      
      {/* 1. Background Video Element */}
      <video
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      >
        {/* 🛑 FIX: Using the correct public path and the correct MIME type (video/mp4) */}
        <source src={videoSource} type="video/mp4" />
        {/* Fallback for browsers that don't support the video tag */}
        Your browser does not support the video tag.
      </video>

      {/* 2. Black Overlay (30% opacity) */}
      <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none"></div>

      {/* 3. Content - Must have a higher z-index (z-20 or higher) */}
      <div className="relative max-w-7xl mx-auto z-20">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3">
            Why Choose Aadhi Jevan Corporate Catering
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-base leading-relaxed">
            We partner with your business to enhance employee well-being and
            productivity through expertly planned, nutritious meals fueling
            your team for success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-black/40 p-6 relative z-30 // Increased z-index for content clarity
                text-white 
                
                // Accent Border and Hover
                border-[var(--primary)]/70 
                shadow-xl shadow-black/20 
                hover:bg-white/20 hover:border-[var(--primary)]
                hover:shadow-2xl hover:shadow-black/50 
                hover:-translate-y-1 transition-all duration-300
              "
            >
              {/* Icon & Title Section */}
              <div className="flex items-center mb-3">
                
                {/* Icon Styling: Solid primary background, white icon */}
                <div className="p-3 rounded-full bg-[var(--primary)] mr-3 shadow-lg shadow-black/50">
                  {feature.icon}
                </div>
                
                {/* Title Styling */}
                <h3 className="text-lg font-bold text-white leading-snug">
                  {feature.title}
                </h3>
              </div>
              
              {/* Description Styling */}
              <p className="text-sm text-gray-200 leading-relaxed mt-2">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Highlight */}
        <div className="text-center mt-12">
          <p className="text-[var(--secondary)] text-lg font-bold tracking-wider italic">
              "A Taste with Love — Over 1 Million Meals Served and Still Counting!"
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;