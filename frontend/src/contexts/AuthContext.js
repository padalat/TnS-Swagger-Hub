import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [token, setToken] = useState(null);
  const [decoded, setDecoded] = useState(null);

  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken); 
      try {
        const decodedToken = jwtDecode(storedToken);
        setDecoded(decodedToken);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);
  

  return (
    <AuthContext.Provider value={{ token, decoded }}>
      {children}
    </AuthContext.Provider>
  );
};
