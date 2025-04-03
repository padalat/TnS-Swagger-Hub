import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

// Creates a portal for the dialog to render at the root level
const DialogPortal = ({ children }) => {
  // Create a div element for the portal
  const portalNode = document.createElement('div');
  portalNode.setAttribute('role', 'dialog');
  portalNode.setAttribute('aria-modal', 'true');
  
  // Add the portal div to the DOM
  useEffect(() => {
    document.body.appendChild(portalNode);
    
    // Prevent scrolling when dialog is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Clean up the portal when the component unmounts
    return () => {
      document.body.removeChild(portalNode);
      document.body.style.overflow = originalStyle;
    };
  }, [portalNode]);
  
  return ReactDOM.createPortal(children, portalNode);
};

/*
  A customizable confirmation dialog component
  
  Props:
  - isOpen: boolean to control dialog visibility
  - title: dialog title
  - message: dialog message
  - confirmText: text for the confirm button
  - cancelText: text for the cancel button
  - onConfirm: function to call when confirm is clicked
  - onCancel: function to call when cancel is clicked
  - type: 'danger', 'warning', or 'info' to control the color scheme
*/
const ConfirmDialog = ({
  isOpen = false,
  title = 'Confirmation',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  
  
  // Handle ESC key press to close the dialog
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);
  
  if (!isOpen) return null;
  
  // Determine button colors based on type
  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: '🛑'
        };
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: 'ℹ️'
        };
    }
  };
  
  const buttonStyles = getButtonStyles();
  
  return (
    <DialogPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
        {/* Dialog */}
        <div 
          className="bg-white rounded-xl shadow-xl transform transition-all max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-2 flex items-center">
            <span className="text-2xl mr-3">{buttonStyles.icon}</span>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          
          {/* Body */}
          <div className="px-6 py-3">
            <p className="text-gray-600">{message}</p>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonStyles.confirm}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
};

export default ConfirmDialog;
