import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from '../utils/requestInterceptor';
import { BASE_API } from "../utils/baseApi";
import Loader from "./Loader";
import WelcomeMessage from "./WelcomeMessage";
import ErrorMessage from "./ErrorMessage";

// Custom environment selector dropdown
const EnvSelector = ({ environments, activeEnv, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mapping of environment keys to display names
  const envNames = {
    'prod_url': 'Production',
    'pre_prod_url': 'Pre-Production',
    'pg_url': 'Playground'
  };
  
  // Custom close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && e.target.closest('.env-dropdown') === null) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);
  
  if (!environments || environments.length <= 1) return null;
  
  return (
    <div className="env-dropdown relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium py-1 px-3 rounded border border-blue-200"
      >
        <span>{envNames[activeEnv] || activeEnv}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute mt-1 right-0 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
          {environments.map(env => (
            <button
              key={env}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${env === activeEnv ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'}`}
              onClick={() => {
                onChange(env);
                setIsOpen(false);
              }}
            >
              {envNames[env] || env}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main SwaggerHub component
const SwaggerHub = () => {
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [apiProjectData, setApiProjectData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get("id");
  const [swaggerSpecData, setSwaggerSpecData] = useState(null);
  const [activeEnvironment, setActiveEnvironment] = useState(urlParams.get("env") || "prod_url");
  const [availableEnvironments, setAvailableEnvironments] = useState([]);
  
  // New method for handling environment change
  const changeEnvironment = (newEnv) => {
    navigate(`/swagger?id=${projectId}&env=${newEnv}`);
  };
  
  // Fetch project details and swagger spec
  useEffect(() => {
    if (!projectId) return;
    
    const fetchProjectAndSpec = async () => {
      setLoadingState(true);
      setErrorState(null);
      
      try {
        // 1. First fetch project details to get URLs
        const projectResponse = await fetch(`${BASE_API}/projects/${projectId}`);
        
        if (!projectResponse.ok) {
          throw new Error(projectResponse.status === 404 
            ? "Project not found" 
            : "Failed to load project details");
        }
        
        const projectData = await projectResponse.json();
        setApiProjectData(projectData);
        
        // 2. Collect available environments
        const envs = [];
        if (projectData.prod_url) envs.push("prod_url");
        if (projectData.pre_prod_url) envs.push("pre_prod_url");
        if (projectData.pg_url) envs.push("pg_url");
        setAvailableEnvironments(envs);
        
        // 3. Ensure the selected environment is available
        if (!projectData[activeEnvironment]) {
          // Fall back to first available environment
          if (envs.length > 0) {
            setActiveEnvironment(envs[0]);
          } else {
            throw new Error("No API documentation URLs configured for this project");
          }
        }
        
        // 4. Now fetch the Swagger specification
        const swaggerResponse = await fetch(
          `${BASE_API}/swagger/get/${projectId}/${encodeURIComponent(activeEnvironment)}`
        );
        
        if (!swaggerResponse.ok) {
          throw new Error("Failed to load API documentation");
        }
        
        const swaggerData = await swaggerResponse.json();
        setSwaggerSpecData(swaggerData.swagger);
      } catch (err) {
        console.error("Error loading API documentation:", err);
        setErrorState(err.message || "Something went wrong loading the API documentation");
      } finally {
        setLoadingState(false);
      }
    };
    
    fetchProjectAndSpec();
  }, [projectId, activeEnvironment]);
  
  // Handle retry functionality
  const handleRetry = () => {
    setErrorState(null);
    setLoadingState(true);
    // Force re-fetch by triggering the useEffect
    const currentEnv = activeEnvironment;
    setActiveEnvironment("temp");
    setTimeout(() => setActiveEnvironment(currentEnv), 10);
  };
  
  // If no project is selected, show welcome screen
  if (!projectId) {
    return <WelcomeMessage />;
  }
  
  // Show loader while fetching
  if (loadingState) {
    return <Loader />;
  }
  
  // Show error message if something went wrong
  if (errorState) {
    return (
      <ErrorMessage 
        error={errorState} 
        retry={handleRetry}
        home={() => navigate('/')}
      />
    );
  }
  
  // Show API documentation if available
  if (swaggerSpecData && apiProjectData) {
    return (
      <div className="api-documentation-container">
        {/* Project info and controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{apiProjectData.projectname}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Team: {apiProjectData.team_name}
              </p>
            </div>
            
            <div className="flex mt-3 md:mt-0 items-center space-x-4">
              <EnvSelector 
                environments={availableEnvironments}
                activeEnv={activeEnvironment}
                onChange={changeEnvironment}
              />
              
              <Link 
                to={`/project/${projectId}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Project Details
              </Link>
            </div>
          </div>
        </div>
        
        {/* SwaggerUI component */}
        <div className="swagger-ui-container bg-white rounded-lg shadow p-1 overflow-hidden">
          <SwaggerUI
            spec={swaggerSpecData}
            requestInterceptor={requestInterceptor}
            docExpansion="list"
            deepLinking={true}
            filter={true}
            syntaxHighlight={{ theme: 'monokai' }}
          />
        </div>
      </div>
    );
  }
  
  // This should not happen, but just in case
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">No API documentation available</p>
      <button 
        onClick={handleRetry}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );
};

export default SwaggerHub;
