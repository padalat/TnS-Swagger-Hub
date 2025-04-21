import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const NavBar = () => {
  const [searchParams] = useSearchParams();
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDate = () => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return currentTime.toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="flex bg-gradient-to-r from-gray-50 to-blue-50 w-full h-[10vh]">
      <aside className="w-[20%] h-full min-w-[250px] border-r border-gray-200">
      <div
        className="p-5 border-b border-gray-200 flex items-center cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={() => {
          navigate("/");
        }}
      >
        <div className="flex-shrink-0 mr-4">
          <img
            src="/images/flipkart-icon.png"
            alt="Logo"
            className="h-9 w-9 rounded-lg shadow-sm"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">FlipDocs</h1>
          <p className="text-xs text-gray-600">API Documentation</p>
        </div>
      </div>

      </aside>
    

      <div className="flex-1 flex flex-col">
        <header className="p-5 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{currentId ? " Swagger" : "Dashboard"}</h1>
            <p className="text-xs text-gray-600 ">{formatDate()}</p>
          </div>
        </header>
      </div>
    </div>
  );
}

export default NavBar;
