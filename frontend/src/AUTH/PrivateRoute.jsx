import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Navbar/AuthContext";


const PrivateRoute = ({ children }) => {
  const { isLoggedIn, authLoaded } = useContext(AuthContext);

  if (!authLoaded) return null;

  return isLoggedIn ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
