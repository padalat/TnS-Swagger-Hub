import React, { useEffect } from 'react';

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const Notification = ({ 
  type = NOTIFICATION_TYPES.INFO, 
  message, 
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  useEffect(() => {
    let timer;
    if (message && autoClose) {
      timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 border-green-500 text-green-800';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 border-red-500 text-red-800';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'text-green-500';
      case NOTIFICATION_TYPES.ERROR:
        return 'text-red-500';
      case NOTIFICATION_TYPES.WARNING:
        return 'text-yellow-500';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'text-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.29289 12.7071L10.5858 16L16.2929 10.2929" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case NOTIFICATION_TYPES.ERROR:
        return (
          <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2ZM12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case NOTIFICATION_TYPES.INFO:
      default:
        return (
          <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center p-4 border-l-4 ${getNotificationStyles()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-3">
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification;