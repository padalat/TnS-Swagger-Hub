import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [token, setToken] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [canRead,setCanRead]=useState(false);
  const [canWrite,setCanWrite]=useState(false);
  const [isAdmin,setIsAdmin]=useState(false);

  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken); 
      try {
        const decodedToken = jwtDecode(storedToken);
        setDecoded(decodedToken);
        setCanRead(decodedToken["flipdocs-user-read"]);
        setCanWrite(decodedToken["flipdocs-user-write"]);{console.log("can ",canRead, canWrite, isAdmin)}
        setIsAdmin(decodedToken["flipdocs-admin"]);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);
  

  return (
    
    <AuthContext.Provider value={{ token, decoded ,canRead, canWrite, isAdmin }}>
      
      {children}
    </AuthContext.Provider>
  );
};
