import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from '../utils/requestInterceptor';
import Loader from "./Loader";
import WelcomeMessage from "./WelcomeMessage";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";

/**
 * SwaggerHub component - displays Swagger/OpenAPI documentation
 * Uses react-router to determine which project to display
 */
const SwaggerHub = () => {
  // Component state
  const [apiDocState, setApiDocState] = useState({
    isInitialized: false,
    isLoading: false,
    hasError: false,
    errorDetails: null,
    specData: null
  });
  
  // Routing
  const locationData = useLocation();
  const navigateTo = useNavigate();
  
  // Extract parameters from URL
  const queryData = useMemo(() => {
    const searchParams = new URLSearchParams(locationData.search);
    return {
      projectIdentifier: searchParams.get("id"),
      apiEnvironment: searchParams.get("env") || "prod_url" // Default to production
    };
  }, [locationData.search]);
  
  // Fetch swagger specification
  useEffect(() => {
    const { projectIdentifier, apiEnvironment } = queryData;
    
    // Only make API call if we have a project ID
    if (!projectIdentifier) {
      setApiDocState({
        isInitialized: true,
        isLoading: false,
        hasError: false,
        errorDetails: null,
        specData: null
      });
      return;
    }
    
    // Start loading
    setApiDocState(prev => ({
      ...prev,
      isInitialized: true,
      isLoading: true,
      hasError: false
    }));
    
    // Construct API URL with properly encoded parameters
    const apiUrl = `${BASE_API}/swagger/get/${projectIdentifier}/${encodeURIComponent(apiEnvironment)}`;
    
    // Fetch the swagger specification
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        return response.json();
      })
      .then(responseData => {
        if (!responseData || !responseData.swagger) {
          throw new Error("Invalid API documentation format");
        }
        
        // Successfully loaded the spec
        setApiDocState({
          isInitialized: true,
          isLoading: false,
          hasError: false,
          errorDetails: null,
          specData: responseData.swagger
        });
      })
      .catch(error => {
        console.error("Error loading API documentation:", error);
        
        // Update state with error
        setApiDocState({
          isInitialized: true,
          isLoading: false,
          hasError: true,
          errorDetails: error.message || "Failed to load API documentation",
          specData: null
        });
      });
  }, [queryData]);
  
  // Handle retry action
  const handleRetry = () => {
    // Reset loading state and force re-fetch
    setApiDocState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorDetails: null
    }));
  };

  // Render appropriate component based on state
  const renderContent = () => {
    const { isLoading, hasError, errorDetails, specData } = apiDocState;
    
    if (hasError) {
      return (
        <ErrorMessage 
          error={errorDetails} 
          retry={handleRetry}
          home={() => navigateTo('/')}
        />
      );
    }
    
    if (isLoading) {
      return <Loader />;
    }
    
    if (specData) {
      return (
        <SwaggerUI
          spec={specData}
          requestInterceptor={requestInterceptor}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          deepLinking={true}
        />
      );
    }
    
    // When no project is selected, display welcome message
    return <WelcomeMessage />;
  };

  return (
    <div className="api-documentation-container w-full h-full p-5">
      {renderContent()}
    </div>
  );
};

export default SwaggerHub;
