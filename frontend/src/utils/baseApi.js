/**
 * Base API configuration for TnS Swagger Hub
 * This module defines API endpoints and environment-specific configuration
 */

// Detect environment and set appropriate base URL
const getApiBaseUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // For production environments
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to relative URL for same-origin deployments
  return '';
};

// Export the base API URL
export const BASE_API = getApiBaseUrl();

// Utility function for API requests with standardized error handling
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${BASE_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Default options with proper content type
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON
        errorData = { detail: response.statusText };
      }
      
      const error = new Error(errorData.detail || 'API request failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

// API version info
export const API_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  toString: function() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
};