// AboutUs.jsx
import React, { useEffect } from 'react';
import { Leaf, Sun, Recycle, ChefHat, UtensilsCrossed, Package, Award, Home, Soup  } from "lucide-react";
import { GiFruitBowl } from "react-icons/gi"; 
import { BiFoodMenu } from "react-icons/bi"; 
import CateringSection from '../components/CateringSection';
import { Link } from "react-router-dom";
import AOS from 'aos'; // Import the library
import 'aos/dist/aos.css';
const KitchenIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v7m0 0v11m0-11h4m6-7v7a2 2 0 004 0V3m-4 18v-6"
    />
  </svg>
);


const TiffinIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0v2m-6-2h-2"
    />
  </svg>
);

const PotIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlateTiffinIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0v2m-6-2h-2M5 19h.01M17 19h.01M12 21h.01" />
  </svg>
);

const UsersIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m0 0l4 4m0 0l4-4m-4 4v-4m-1-10l-4-4H5a2 2 0 00-2 2v10a2 2 0 002 2h2m0 0l4 4m0 0l4-4m-4 4v-4m-1-10l-4-4" />
  </svg>
);

const SparklesIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10.707 2.293a1 1 0 00-1.414 0L6.293 5.293a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 7H17a1 1 0 100-2H8.414l2.293-2.293a1 1 0 000-1.414zM16.707 18.293a1 1 0 00-1.414 0l-3-3a1 1 0 000 1.414L15.586 17H7a1 1 0 100 2h8.586l-2.293 2.293a1 1 0 000 1.414 1 1 0 001.414 0l3-3a1 1 0 000-1.414l-3-3z" />
  </svg>
);


const About = () => {
  useEffect(() => {
    AOS.init({
     
      duration: 1200, 
      once: true, 
    });
  }, []);
  // Defined teamMembers array
  const teamMembers = [
    {
      name: "Master Chef Rakesh Srivastav",
      role: "Head of Kitchen & Tradition",
      description: "30 years of experience in authentic regional cuisine. Ensures every recipe honors our heritage.",
      image: "/Images/team1.jpg",
    },
    {
      name: "Master Chef Priya Singh",
      role: "Service & Operations Head",
      description: "Manages restaurant service and tiffin logistics, dedicated to ensuring customer satisfaction.",
      image: "/Images/team2.jpg",
    },
    {
      name: "Master Chef Vikas Parihar",
      role: "Tiffin & Meal Prep Specialist",
      description: "Specializes in creating balanced, nutritious, and diverse meals for our daily tiffin service.",
      image: "/Images/team3.jpg",
    },
    {
      name: "Master Chef Rohan Sharma",
      role: "Delivery Team Lead",
      description: "Leads the delivery logistics to guarantee punctuality and the integrity of your hot meals.",
      image: "/Images/team4.jpg",
    },
  ];

  return (
    <div className='overflow-x-hidden overflow-y-hidden'>
    <div className="bg-[var(--secondary)] text-[var(--accent)] min-h-screen">
      {/* 1. Hero Section - No AOS on Hero, it's immediately visible */}
      <div
        className="relative bg-cover bg-center h-96 md:h-[520px]"
        style={{
          backgroundImage: `url('/Images/loginn.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-6" data-aos="fade-up" data-aos-duration="1000">
            <p className="text-xl font-semibold uppercase tracking-widest text-[var(--highlight)] mb-2">
              Our Journey
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold">
              The Story Behind <span className="text-[var(--optional-accent)]">Aadhi Jevan</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto font-light">
              Nourishing your soul with Restaurant quality and the convenience of Tiffin Service.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Our Story & Philosophy */}
     <section className="relative py-10 overflow-hidden bg-gradient-to-b from-[var(--secondary)] to-white">
  {/* Decorative Background Elements */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-0 w-60 h-60 bg-[var(--highlight)]/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-3xl"></div>
  </div>

  <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
    
    {/* Left Content */}
    <div data-aos="fade-right" data-aos-duration="1000" className="space-y-6">
         <header className="text-center mb-6 relative">
         <div 
  className="absolute inset-0 flex items-center justify-center pointer-events-none 
             transform -translate-y-8 sm:-translate-y-6"
>
  <span 
    className="mb-6 md:mb-0 text-5xl sm:text-[1rem] md:text-[2rem] lg:text-[5rem] 
               font-extrabold text-[var(--gray)] opacity-10 
               md:-translate-x-20"
  >
    Philosophy
  </span>
</div>

      <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent)] flex items-center gap-3">
       
        Our Culinary Philosophy
      </h2>
      </header>

      <p className="text-lg text-[var(--accent)]/80 leading-relaxed">
        <span className="font-semibold text-[var(--accent)]">Aadhi Jevan</span> was founded on the principle of uncompromising authenticity and heartfelt tradition.  
        Every meal whether served in-house or delivered embodies the warmth of a home-cooked feast made with care.
      </p>

      <p className="text-lg text-[var(--accent)]/80 leading-relaxed">
        Our chefs honor time-tested recipes and locally sourced ingredients, blending culture and craft in every bite.  
        From freshly ground spices to slow-cooked gravies, every flavor tells a story of passion and purpose.
      </p>

      <blockquote
        className="relative border-l-4 border-[var(--highlight)] pl-6 italic text-[var(--accent)]/90 text-lg"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        
        “We don’t just serve meals we share memories, love, and the comfort of authenticity.”
      </blockquote>
    </div>

    {/* Right Image with Overlay & Motion */}
    <div
      className="relative  overflow-hidden shadow-2xl transform hover:scale-[1.03] transition-all duration-500 group"
      data-aos="fade-left"
      data-aos-duration="1000"
    >
      <img
        src="/Images/restaurant.jpg"
        alt="Chef preparing traditional Indian meal"
        className="w-full h-[420px] object-cover brightness-95 transition-all duration-500 group-hover:brightness-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-lg uppercase tracking-wide font-semibold">Crafted with Love</p>
        <p className="text-sm opacity-90">Authentic • Wholesome • Fresh</p>
      </div>
    </div>
  </div>
</section>


      {/* 3. Dual Service Model */}
      <section className="bg-[var(--secondary)] py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-12 md:mb-0 text-5xl sm:text-[1rem] md:text-[2rem] lg:text-[5rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                    Dual Service
                </span>
            </div>
           <h1 className="flex items-center gap-2 justify-center text-4xl font-bold text-[var(--accent)] sm:text-5xl " data-aos="zoom-in-up">
             {/* <PlateTiffinIcon className="w-8 h-8 text-[var(--primary)]" /> */}
            
               Our Unique Dual-Service Commitment
            
           </h1>
</header>
          <p className="mt-4 text-xl text-[var(--accent)]/80 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Experience the best of both worlds: Fine dining atmosphere and home-cooked convenience.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-[var(--highlight)]" data-aos="flip-up" data-aos-delay="200">
              <Soup  className="w-12 h-12 mx-auto text-[var(--primary)]" />
              <h3 className="mt-4 text-2xl font-bold text-[var(--accent)] ">
                The Aadhi Jevan Restaurant
              </h3>
              <p className="mt-4 text-[var(--accent)]/80 text-lg">
                Our physical restaurant offers an inviting ambiance to enjoy a full culinary experience. Our chefs plate their best work, allowing you to savor hot, fresh meals right from the kitchen perfect for family gatherings and special moments.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-[var(--optional-accent)]" data-aos="flip-up" data-aos-delay="400">
              <TiffinIcon className="w-12 h-12 mx-auto text-[var(--primary)]" />
              <h3 className="mt-4 text-2xl font-bold text-[var(--accent)]">
                Reliable Tiffin Service
              </h3>
              <p className="mt-4 text-[var(--accent)]/80 text-lg">
                For your daily nutritional needs, our Tiffin Service delivers wholesome, balanced,
                and hygienic meals. It's the comfort of home-cooked food delivered to your office or
                residence, ensuring you never miss a nutritious, authentic meal.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 4. Meet Our Team Section - IMPRESSIVE UI */}
      <section className="relative py-8 md:py-8 max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* 🔹 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        {/* ⚠️ Replace with your actual file path */}
        <source src="/videos/chefvideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔹 Overlay for text readability */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* 🔹 Optional floating gradient effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--highlight)]/10"></div>
      </div>

      {/* 🔹 Content Wrapper */}
      <div className="relative z-10">
        {/* Heading */}
        <h1
          className="flex items-center justify-center gap-3 text-4xl font-bold text-white sm:text-5xl relative"
          data-aos="fade-down"
        >
         
         
            Meet Our Culinary Family
           
        </h1>

        <p
          className="mt-6 text-xl text-gray-200/90 max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          The heart of Aadhi Jevan lies with our passionate team, dedicated to
          serving authenticity and excellence in every dish.
        </p>

        {/* Team Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-md p-8 pt-20 rounded-xl 
                        shadow-2xl hover:shadow-[var(--primary)]/40 
                        hover:-translate-y-3 transition-all duration-500 
                        flex flex-col items-center border border-white/20
                        transform perspective-[1000px] hover:rotate-y-2 hover:rotate-x-1
                        animate-fade-in"
              data-aos="zoom-in"
              data-aos-delay={index * 150}
            >
              {/* Image & Role Icon */}
              <div className="absolute -top-10 w-28 h-28 rounded-full bg-[var(--primary)] flex items-center justify-center 
                              mx-auto border-4 border-white/60 shadow-xl 
                              group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden">
                <img
                  className="w-full h-full rounded-full object-cover p-1 bg-white/20"
                  src={member.image}
                  alt={member.name}
                />
                {/* <div className="absolute bottom-0 right-0 p-1 bg-[var(--highlight)] rounded-full border border-white">
                  {member.icon}
                </div> */}
              </div>

              <h3 className="mt-8 text-2xl font-bold text-white group-hover:text-[var(--primary)] transition-colors duration-300">
                {member.name}
              </h3>
              <p className="text-[var(--primary)] font-semibold text-base mt-1">
                {member.role}
              </p>
              <p className="mt-4 text-gray-200/80 text-sm leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* 5. Unique USP Section: Culinary Innovation - With Background Image and Overlay */}
     

      
      {/* 6. Why Choose Us Section - Single Kitchen Focus */}
      <section className="py-8 md:py-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-14 md:mb-0 text-5xl sm:text-[1rem] md:text-[2rem] lg:text-[5rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                    Advantage
                </span>
            </div>
        
        <h1 className="flex items-center gap-2 justify-center text-4xl font-bold text-[var(--accent)] sm:text-5xl " data-aos="fade-down">
         
            The Aadhi Jevan Advantage
       
        </h1>
        </header>
        <p className="mt-4 text-xl text-[var(--accent)]/80 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
          Our exclusive focus on a single, master kitchen ensures unparalleled quality in both
          restaurant and delivery services.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-14">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:translate-y-[-5px]" data-aos="zoom-in" data-aos-delay="200">
            <GiFruitBowl  className="w-10 h-10 mx-auto text-[var(--primary)]" />
            <h3 className="mt-4 text-xl font-semibold text-[var(--accent)]">
              Daily Sourced Freshness
            </h3>
            <p className="mt-2 text-[var(--accent)]/80">
              We eliminate cold storage. All ingredients are procured daily from local vendors to
              ensure that what you eat was prepared just hours ago, guaranteed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:translate-y-[-5px]" data-aos="zoom-in" data-aos-delay="400">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-[var(--primary)]" />

            <h3 className="mt-4 text-xl font-semibold text-[var(--accent)]">
              100% Master Chef Quality
            </h3>
            <p className="mt-2 text-[var(--accent)]/80">
              Consistency is key. Every dish, whether for a table or a tiffin, is perfected by our
              master chefs. No compromises, ever.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:translate-y-[-5px]" data-aos="zoom-in" data-aos-delay="600">
            <Home className="w-10 h-10 mx-auto text-[var(--primary)]" />
            <h3 className="mt-4 text-xl font-semibold text-[var(--accent)]">
              In-House Delivery Care
            </h3>
            <p className="mt-2 text-[var(--accent)]/80">
              We use our own dedicated delivery team. They are trained for speed and care, ensuring
              your meal arrives hot, fresh, and exactly as it left our kitchen.
            </p>
          </div>
        </div>
      </section>


      <CateringSection/>

      {/* 7. Call to Action */}
      <div className="bg-[var(--primary)] text-white text-center py-12" data-aos="fade-up">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm: text-5xl font-bold">
            Ready for a Real, Wholesome Meal?
          </h1>
          <p className="mt-2 text-xl font-light">
            Visit our restaurant or subscribe to our daily tiffin service today!
          </p>
         <button className="mt-6 px-10 py-3 bg-white text-[var(--primary)] font-bold rounded-full text-lg shadow-xl hover:bg-[var(--secondary)] transition duration-300 transform hover:scale-[1.05]" data-aos="zoom-in" data-aos-delay="200">
           <Link to="/menu" className="block">
             Order Now & Taste the Aadhi Jevan Difference!
           </Link>
         </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default About;