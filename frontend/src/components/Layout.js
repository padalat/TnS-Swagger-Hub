import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Custom component for navigation links with active state
const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Unique styling approach with conditional gradient background
  const linkClasses = `
    flex items-center px-4 py-2.5 mb-1 rounded-lg transition-all duration-200
    ${isActive 
      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white font-medium shadow-md' 
      : 'text-gray-700 hover:bg-gray-100'}
  `;
  
  return (
    <Link to={to} className={linkClasses}>
      <span className={`mr-3 ${isActive ? 'text-white' : 'text-blue-600'}`}>{icon}</span>
      <span>{children}</span>
      {isActive && (
        <span className="ml-2 flex h-2 w-2 rounded-full bg-blue-200"></span>
      )}
    </Link>
  );
};

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format date in a unique way
  const formatDate = () => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return currentTime.toLocaleDateString('en-US', options);
  };
  
  // Custom toggle menu function with state management
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    // Prevent body scrolling when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/projects", label: "All Projects", icon: "📋" },
    { path: "/add", label: "Add Project", icon: "➕" },
    // Teams navigation link removed
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg">
        <div className="p-4 border-b flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">TnS Hub</h1>
            <p className="text-xs text-gray-500">Swagger Documentation</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Main Navigation</h2>
            <div className="space-y-1">
              {navigationItems.map(item => (
                <NavLink key={item.path} to={item.path} icon={item.icon}>{item.label}</NavLink>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={toggleMobileMenu}></div>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <div className="p-4 border-b flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">TnS Hub</h1>
            <p className="text-xs text-gray-500">Swagger Documentation</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Main Navigation</h2>
            <div className="space-y-1">
              {navigationItems.map(item => (
                <NavLink key={item.path} to={item.path} icon={item.icon}>{item.label}</NavLink>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 bg-white shadow-md flex items-center justify-between">
          <button className="md:hidden text-gray-600" onClick={toggleMobileMenu}>
            <span className="material-icons">menu</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-500">{formatDate()}</p>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
