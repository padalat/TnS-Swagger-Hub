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
        
        console.log(decodedToken.roles);
        const output = convert(decodedToken.roles.flipdocs);
        console.log(output);
        setDecoded(output);
        setCanRead(output["flipdocs-user-read"]);
        setCanWrite(output["flipdocs-user-write"]);{console.log("can ",canRead, canWrite, isAdmin)}
        setIsAdmin(output["flipdocs-admin"]);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  function convert(payload) {
    const teamPermissions = {};

    // Build team permissions
    for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
            const regex = /flipdocs\.(\w+)\.(admin|read|write)/;
            const match = key.match(regex);
            if (match) {
                const [, team, permission] = match;
                if (!teamPermissions[team]) {
                    teamPermissions[team] = {};
                }
                teamPermissions[team][permission] = payload[key];
            }
        }
    }

    // Find first team with any truthy permission
    let teamName = null;
    for (const team in teamPermissions) {
        if (Object.values(teamPermissions[team]).some(value => value)) {
            teamName = team;
            break;
        }
    }

    // Build the output object
    const outputObj = {
        "flipdocs-admin": teamPermissions[teamName] ? teamPermissions[teamName]["admin"] || false : false,
        "flipdocs-user-read": teamPermissions[teamName] ? teamPermissions[teamName]["read"] || false : false,
        "flipdocs-user-write": teamPermissions[teamName] ? teamPermissions[teamName]["write"] || false : false,
        "team_name": teamName
    };

    return outputObj;
}
  

  return (
    
    <AuthContext.Provider value={{ token, decoded ,canRead, canWrite, isAdmin }}>
      
      {children}
    </AuthContext.Provider>
  );
};
