


import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import OTPForm from "./pages/OTPForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import Checkout from "./pages/Checkout";
import FAQ from "./pages/FAQ";
import Footer from "./components/Footer";
import MyCart from "./pages/MyCart";
import Cart from "./pages/Cart";
import MenuDetail from "./pages/MenuDetail";
import ScrollToTop from "./components/ScrollToTop";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./components/OrderHistory";
import { CartProvider } from "./context/CartContext"; 
import SupportPage from "./pages/SupportPage";
import Float from "./components/FloatContaction";


function AppContent() {
  const location = useLocation();
// ✅ Pages where both Navbar and Footer are hidden
  const hideHeaderFooter = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Navbar />}

<div className={!hideHeaderFooter ? "" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/a" element={<Cart/>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:category" element={<Menu />} />
          <Route path="/search" element={<SearchResults />} />
           <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/verify-otp" element={<OTPForm />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/mycart" element={<MyCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/item/:slug" element={<MenuDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/support" element={<SupportPage />} />
          
        </Routes>
        <Float/>
      </div>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop/>
      <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;   // ✅ this line must be here!

