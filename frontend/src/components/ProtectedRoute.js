import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  if (!token || token === "null" || token === "undefined") {
    return <div>Auth required</div>;
  }
  
  return children;
};

export default ProtectedRoute;
