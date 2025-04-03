import React from 'react';

/**
 * Custom error message component
 */
const ErrorMessage = ({ 
  error,
  title = 'Error',
  retry = null,
  home = null,
  variant = 'default'
}) => {
  // Get error message from various error types
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error?.detail) return error.detail;
    if (error?.message) return error.message;
    return 'An unknown error occurred';
  };
  
  // Various error variants
  const renderErrorContent = () => {
    const message = getErrorMessage();
    
    switch (variant) {
      case 'minimal':
        return (
          <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <svg className="w-4 h-4 mr-1.5 text-red-500" />
            <span>{message}</span>
          </div>
        );
      default:
        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded my-4">
            <div className="flex flex-col h-full items-center justify-center">
              <h1 className="text-[48px] font-bold">{title}</h1>
              <span>{message}</span>
              {retry && <button onClick={retry} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>}
              {home && <button onClick={home} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Home</button>}
            </div>
          </div>
        );
    }
  };

  return renderErrorContent();
};

export default ErrorMessage;
