import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Import admin pages
import Dashboard from "./pages/Dashboard";
import AllItems from "./pages/AllItems";
import OrderHistory from "./pages/OrderHistory";
import Notifications from "./pages/Notification";
import AddMenuItem from "./pages/AddItems";
import TodaysMenu from "./pages/TodaysMenu";
import CustomizeBox from "./pages/CustomizeBox";
import FruitBowls from "./pages/FruitBowls";
import Settings from "./pages/Settings";

// Import login page
import Login from "./pages/Login";
import Users from "./pages/Users";
import AdminReviews from "./pages/AdminReviews";
import Statistics from "./pages/Statistics";
import ScrollToTop from "./components/ScrollToTop";

// Wrapper to conditionally show Sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebarRoutes = ["/login"]; // routes where sidebar shouldn't show
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <main className={`flex-1 min-h-screen ${!hideSidebar ? 'page-content' : ''}`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <ScrollToTop/>
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Admin Pages */}
          <Route path="/orders" element={<Dashboard />} />
          <Route path="/allitems" element={<AllItems />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Statistics />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/additems" element={<AddMenuItem />} />
          <Route path="/todays-menu" element={<TodaysMenu />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/customizebox" element={<CustomizeBox />} />
          <Route path="/fruitbowls" element={<FruitBowls />} />
          <Route path="/settings" element={<Settings />} />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-2xl font-semibold text-red-600">
                  404 - Page Not Found
                </h1>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
