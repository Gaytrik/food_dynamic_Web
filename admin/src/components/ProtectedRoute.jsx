// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../pages/utils/auth"

const ProtectedRoute = ({ element }) => {
  return isLoggedIn() ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
