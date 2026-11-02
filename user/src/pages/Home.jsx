import React from "react";
import HeroSection from "../components/HeroSection";
import TodaysMenu from "../components/TodaysMenu";
import WhyChooseUs from "../components/WhyChooseUs";
import DiscoverMenu from "../components/DiscoverMenu";
import OrderBanner from "../components/OrderBanner";
import Explore from "../components/Explore";
import ClientLogo from "../components/ClientLogo";
import Services from "../components/Services";


const Home = () => {
  return (
    <div className="">
       <HeroSection />
       <TodaysMenu/>
       <OrderBanner/>
       <Explore/>
        <WhyChooseUs/>
       <DiscoverMenu/>
       <ClientLogo/>
       <Services/>
      
    </div>
  );
};

export default Home;

