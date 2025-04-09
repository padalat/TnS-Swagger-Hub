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
    <div className="flex bg-gray-50 w-full">
    <aside className="w-[20%] bg-white shadow-lg">
    <div
      className="p-4 border-b flex items-center cursor-pointer"
      onClick={() => {
        navigate("/");
      }}
    >
      <div className="flex-shrink-0 mr-3">
        <img
          src="/images/flipkart-icon.png"
          alt="Logo"
          className="h-8 w-8 rounded-md"
        />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">FlipDocs</h1>
        <p className="text-xs text-gray-500">API Documentation</p>
      </div>
    </div>

    </aside>
    

    <div className="flex-1 flex flex-col">
      <header className="p-4 bg-white shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{currentId ? " Swagger" : "Dashboard"}</h1>
          <p className="text-xs text-gray-500">{formatDate()}</p>
        </div>
      </header>

    </div>
  </div>

  );
}

export default NavBar;
