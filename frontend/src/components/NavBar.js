import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const NavBar = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  
  // Reset application state and navigation
  const handleHomeClick = () => {
    navigate('/', { replace: true });
    setSearchParams({});
    // You can reset other global state here if needed
  };
  
  return (
    <nav className='w-full bg-[#1b1b1b] text-white h-[70px] flex px-5 py-2 justify-center items-center'>
      <div className='w-[90%]'>
        <h1 className='text-[20px] font-bold'>
          <button 
            onClick={handleHomeClick}
            className="text-white hover:text-gray-300 transition-colors"
          >
            TnS SwaggerHub
          </button>
        </h1>
      </div>
    </nav>
  );
}

export default NavBar;
