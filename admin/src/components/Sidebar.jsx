import React, { useState, useEffect } from "react";
import {
  Home,
  Package,
  Menu,
  X,
ShoppingCart,
  LogOut,
  ChefHat,
  Users,
  Box,
  Grape,
  DollarSign,
  LineChart
  
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top smoothly on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Disable body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/analytics", label: "Dashboard", icon: <LineChart size={20} /> },
    { path: "/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { path: "/allitems", label: "All Items", icon: <Package size={20} /> },
    { path: "/todays-menu", label: "Today's Menu", icon: <ChefHat size={20} /> },
    { path: "/CustomizeBox", label: "Customize Box", icon: <Box size={20} /> },
    { path: "/FruitBowls", label: "Fruit Bowl", icon: <Grape size={20} /> },
    { path: "/users", label: "Users", icon: <Users size={20} /> },
    { path: "/settings", label: "Fees", icon: <DollarSign size={20} /> },
    { path: "/reviews", label: "Reviews", icon: <Users size={20} /> },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* MOBILE HEADER - Fixed at top */}
      <div className="fixed md:hidden flex items-center justify-between px-4 mb-10 h-16 bg-white border-b border-gray-200 top-0 left-0 right-0 z-40 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--primary)] ">
          Aadhi Jevan
        </h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY - Only shows when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[var(--secondary)] to-white border-r border-gray-200 flex flex-col z-50 shadow-xl transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:z-30
        ${isMinimized ? "md:w-20" : "md:w-64"} w-64`}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
          {/* Mobile header with close button */}
          <div className="flex items-center justify-between md:hidden">
            <h1 className="text-2xl font-bold text-[var(--primary)] ">
              Aadhi Jevan
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-center">
            {!isMinimized && (
              <h1 className="text-2xl font-bold text-[var(--primary)] ">
                Aadhi Jevan
              </h1>
            )}
            {isMinimized && (
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                A
              </div>
            )}
          </div>
        </div>

        {/* MENU ITEMS - Scrollable area */}
     <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 no-scrollbar">
      <ul className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                    ${
                      isActive(item.path)
                        ? "bg-[var(--primary)] text-white shadow-lg"
                        : "hover:bg-[var(--optional-accent)]/20 text-[var(--accent)] hover:shadow-md"
                    } 
                    ${isMinimized ? "md:justify-center md:px-3" : ""}`}
                  title={isMinimized ? item.label : ""}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isMinimized && (
                    <span className="transition-opacity duration-200 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* LOGOUT BUTTON - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full hover:shadow-md active:scale-95
              ${isMinimized ? "md:justify-center md:px-3" : ""}`}
            title={isMinimized ? "Logout" : ""}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isMinimized && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* SPACER for desktop to prevent content overlap */}
      <div className={`hidden md:block flex-shrink-0 ${isMinimized ? "md:w-20" : "md:w-64"}`} />

      {/* SPACER for mobile to prevent content overlap with header */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default Sidebar;
