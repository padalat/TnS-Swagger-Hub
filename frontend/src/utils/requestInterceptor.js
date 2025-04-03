/**
 * Custom request interceptor for Swagger UI
 * Handles authentication, headers, and other request modifications
 */
const requestInterceptor = (request) => {
  // Create a copy of the request to avoid mutations
  const enhancedRequest = { ...request };
  
  // Add custom headers for API requests
  enhancedRequest.headers = {
    ...enhancedRequest.headers,
    'X-Client-App': 'TNS-SwaggerHub',
    'X-Client-Version': '1.0.0'
  };
  
  // Prevent caching by adding a timestamp parameter to GET requests
  if (enhancedRequest.method === 'GET') {
    const urlObj = new URL(enhancedRequest.url);
    urlObj.searchParams.append('_t', Date.now());
    enhancedRequest.url = urlObj.toString();
  }
  
  // Check if CORS proxy is needed
  const isExternalUrl = /^https?:\/\//.test(enhancedRequest.url) && 
    !enhancedRequest.url.includes(window.location.hostname);
  
  if (isExternalUrl) {
    // Use our built-in CORS proxy for external requests
    const originalUrl = enhancedRequest.url;
    enhancedRequest.url = `/api/cors-proxy?url=${encodeURIComponent(originalUrl)}`;
    
    // Add the original URL in a custom header for logging
    enhancedRequest.headers['X-Original-URL'] = originalUrl;
  }
  
  return enhancedRequest;
};

export default requestInterceptor;