import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "/public/logos/Group 146.png";

import {
  ShoppingCart,
  Search,
  LogIn,
  Menu,
  X,
  Home,
  Info,
  Utensils,
  Mail,
  User,
  HelpCircle,
  History,
} from "lucide-react";
import UniversalSearch from "./UniversalSearch";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems } = useCart();
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
    : 0;

  const navLinks = [
    { name: "Home", path: "/", Icon: Home },
    { name: "Menu", path: "/menu", Icon: Utensils },
    { name: "About Us", path: "/about", Icon: Info },
    { name: "Contact Us", path: "/contact", Icon: Mail },
    { name: "Support", path: "/support", Icon: HelpCircle },
    { name: "Order History", path: "/orderhistory", Icon: History },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // 🔒 Disable background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsSidebarOpen(false);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) handleNavigate("/profile");
    else handleNavigate("/login");
    setIsSidebarOpen(false);
  };

  const activeLinkStyle = "bg-[var(--primary)] text-white shadow-md";

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--secondary)] border-b border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between w-full max-w-[100vw] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2">

        {/* Logo */}
        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center text-2xl font-bold transition-all"
          aria-label="Go to home"
        >
          <img
            src={logo}
            alt="Aadhi Jevan logo"
            className="w-8 h-8 mr-3 object-contain"
            loading="lazy"
          />
          <span className="text-[var(--accent)] text-2xl font-extrabold">
            Aadhi Jevan
          </span>
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-4">

          <div className="w-48 sm:w-60 md:w-72 lg:w-80 xl:w-96 relative">
            <UniversalSearch placeholder="Enter item you are looking for" />
          </div>

          {/* Desktop Cart */}
          <button
            onClick={() => handleNavigate("/mycart")}
            className="relative p-2 text-[var(--accent)] hover:bg-gray-100 rounded-full transition"
            title="Cart"
          >
            <ShoppingCart className="w-6 h-6" />

            {/* Hide cart badge if 0 */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border border-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={handleAuthClick}
            className="bg-[var(--primary)] text-[var(--secondary)] px-5 py-2.5 text-sm font-semibold transition shadow-md flex items-center"
            title={isLoggedIn ? "Profile" : "Sign In"}
          >
            <span>{isLoggedIn ? "Profile" : "Sign In"}</span>
          </button>

          {/* Desktop Sidebar */}
          <div
            className="relative"
            onMouseEnter={() => setIsSidebarOpen(true)}
            onMouseLeave={() => setIsSidebarOpen(false)}
          >
            <button
              className="flex items-center space-x-1 p-2 text-[var(--accent)] hover:bg-gray-100 rounded-full transition"
              title="Navigation Links"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              className={`fixed top-0 right-0 h-full w-[280px] md:w-[320px] bg-gradient-to-b from-[var(--secondary)] to-gray-50 shadow-[0_0_20px_rgba(0,0,0,0.15)] border-l border-gray-200 transform transition-all duration-300 ease-in-out z-50
                ${
                  isSidebarOpen
                    ? "translate-x-0 opacity-100 pointer-events-auto"
                    : "translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-[var(--secondary)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--accent)] tracking-wide">
                  Navigation
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-[var(--accent)] hover:text-[var(--primary)] transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100%-65px)]">
                {navLinks.map(({ name, path, Icon }) => (
                  <button
                    key={path}
                    onClick={() => handleNavigate(path)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 w-full text-left
                      ${
                        location.pathname === path
                          ? activeLinkStyle
                          : "text-[var(--accent)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                        location.pathname === path
                          ? "text-white"
                          : "text-[var(--primary)]"
                      }`}
                    />
                    <span>{name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center md:hidden space-x-3">
          <button onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-6 h-6 text-[var(--accent)]" />
          </button>

          <button
            onClick={() => handleNavigate("/mycart")}
            className="relative p-2 text-[var(--accent)] hover:text-black transition"
          >
            <ShoppingCart className="w-6 h-6" />

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[var(--primary)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X className="w-7 h-7 text-[var(--accent)] transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="w-7 h-7 text-[var(--accent)] transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <UniversalSearch placeholder="Search dishes, categories..." />
        </div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-[var(--secondary)] shadow-2xl border-r transform transition-transform duration-500 ease-in-out ${
          isMenuOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none"
        } md:hidden z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[var(--primary)]">Menu</h2>
          <button onClick={() => setIsMenuOpen(false)}>
            <X className="w-6 h-6 text-[var(--accent)]" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map(({ name, path, Icon }) => (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                location.pathname === path
                  ? activeLinkStyle
                  : "text-[var(--accent)] hover:text-white hover:bg-[var(--primary)]/80"
              }`}
            >
              <Icon className="w-5 h-5" /> {name}
            </button>
          ))}

          <button
            onClick={() => handleNavigate("/mycart")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[var(--accent)] hover:text-white hover:bg-[var(--primary)]/80 transition"
          >
            <ShoppingCart className="w-5 h-5" /> Cart
            {cartCount > 0 && (
              <span className="ml-auto bg-[var(--primary)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {!isLoggedIn ? (
            <button
              onClick={() => handleNavigate("/login")}
              className="mt-4 bg-[var(--primary)] text-[var(--secondary)] px-4 py-2 font-semibold shadow-md rounded transition"
            >
              Sign In / Register
            </button>
          ) : (
            <button
              onClick={() => handleNavigate("/profile")}
              className="flex items-center gap-3 px-4 py-3 mt-3 font-medium bg-[var(--primary)]/50 text-[var(--secondary)] shadow-md rounded transition"
            >
              <User className="w-5 h-5" /> Profile
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
