// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../pages/utils/auth";

const PublicRoute = ({ element }) => {
  return isLoggedIn() ? <Navigate to="/admindashboard" replace /> : element;
};

export default PublicRoute;
