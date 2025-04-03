import React, { useState, useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

// Custom wrapper for enhanced SwaggerUI with additional features
const SwaggerViewer = ({ 
  specification,
  baseUrl,
  environment = 'prod', 
  showTopBar = true,
  enableTryItOut = true,
  supportedEnvs = ['prod', 'preprod', 'pg']
}) => {
  const [activeEnv, setActiveEnv] = useState(environment);
  const [enhancedSpec, setEnhancedSpec] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const containerRef = useRef(null);
  
  // Handle environment changes and URL substitution
  useEffect(() => {
    if (!specification) return;
    
    // Deep clone the specification to avoid mutating the original
    const processedSpec = JSON.parse(JSON.stringify(specification));
    
    try {
      // Update servers array based on selected environment
      if (processedSpec.servers && Array.isArray(processedSpec.servers)) {
        // Keep original servers
      } else if (baseUrl) {
        processedSpec.servers = [{ url: baseUrl }];
      }
      
      // Add custom branding
      if (!processedSpec.info) {
        processedSpec.info = {};
      }
      
      if (!processedSpec.info['x-logo']) {
        processedSpec.info['x-logo'] = {
          url: 'https://example.com/logo.png',
          altText: 'TNS Swagger Hub'
        };
      }
      
      setEnhancedSpec(processedSpec);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error processing Swagger specification:', error);
      setErrorMsg('Failed to process the API specification.');
    }
  }, [specification, activeEnv, baseUrl]);
  
  // Fullscreen toggling with escape key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);
  
  // Custom request interceptor function to add headers, auth tokens, etc.
  const requestInterceptor = (req) => {
    // Add timestamps to prevent caching issues
    const timestamp = Date.now();
    const url = new URL(req.url);
    url.searchParams.append('_ts', timestamp);
    req.url = url.toString();
    
    // You can add custom auth headers here if needed
    // req.headers['Authorization'] = 'Bearer YOUR_TOKEN_HERE';
    
    return req;
  };
  
  // Custom UI options for Swagger UI React
  const uiOptions = {
    docExpansion: 'list',
    filter: true,
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
    tryItOutEnabled: enableTryItOut,
    persistAuthorization: true,
    requestInterceptor: requestInterceptor,
    onComplete: () => {
      setIsLoading(false);
    }
  };
  
  // Environment selector component
  const EnvironmentSelector = () => (
    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-gray-700 font-medium">Environment:</h3>
          <div className="flex space-x-2">
            {supportedEnvs.map(env => (
              <button
                key={env}
                className={`px-3 py-1 text-sm rounded ${
                  activeEnv === env 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveEnv(env)}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="text-blue-600 hover:text-blue-800 flex items-center"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          <span className="mr-1">
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </span>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            {isFullscreen ? (
              <path d="M5 8V5h3v2H5v1zm12 0v1h-3V5h3v3zm-3 9h3v-3h-2v2h-1v1zM8 17v-1H5v-2H3v3h5z" />
            ) : (
              <path d="M3 5h5V3H3v5h2V5zm9 0h3v3h2V3h-5v2zm3 9h-3v2h5v-5h-2v3zM5 15H3v-5h2v3h3v2H5z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
  
  // Custom styles to inject into container
  const customStyles = `
    .swagger-ui .topbar { display: ${showTopBar ? 'block' : 'none'}; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { box-shadow: none; }
    .swagger-ui .opblock-tag { font-size: 18px; }
    .swagger-ui .opblock .opblock-summary-method { min-width: 80px; font-weight: bold; }
    .swagger-ui table tbody tr td { padding: 8px 0; }
  `;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (errorMsg) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border-l-4 border-red-500">
        <h3 className="font-medium">Error Loading Specification</h3>
        <p>{errorMsg}</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className={`swagger-viewer-tns ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'relative'}`}
    >
      {supportedEnvs.length > 1 && <EnvironmentSelector />}
      
      <style>{customStyles}</style>
      
      {enhancedSpec ? (
        <SwaggerUI
          spec={enhancedSpec}
          {...uiOptions}
        />
      ) : (
        <div className="flex justify-center items-center p-12 text-gray-500">
          No specification available
        </div>
      )}
    </div>
  );
};

export default SwaggerViewer;
