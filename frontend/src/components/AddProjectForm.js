import React, { useState, useEffect } from "react";
import { BASE_API } from "../utils/baseApi"; // Fixed import path

// Custom form component with validation
const AddProjectForm = ({ onAddProject, editProject, setEditProject, setProjects }) => {
  // Form state with structured approach for better maintainability 
  const [formData, setFormData] = useState({
    projectName: "",
    teamName: "",
    prodUrl: "",
    preprodUrl: "",
    pgUrl: ""
  });
  
  // Separate states for loading and notifications
  const [isProcessing, setIsProcessing] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ message: "", type: "" });
  const [validationErrors, setValidationErrors] = useState({});
  
  // When in edit mode, populate form with existing project data
  useEffect(() => {
    if (editProject) {
      setFormData({
        projectName: editProject.projectname || "",
        teamName: editProject.team_name || "",
        prodUrl: editProject.prod_url || "",
        preprodUrl: editProject.pre_prod_url || "",
        pgUrl: editProject.pg_url || ""
      });
    }
  }, [editProject]);
  
  // Handle input changes with field validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Validate URL format
  const isValidUrl = (url) => {
    if (!url) return true; // Empty is acceptable for non-required fields
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Project name validation
    if (!formData.projectName.trim()) {
      errors.projectName = "Project name is required";
    } else if (formData.projectName.length < 3) {
      errors.projectName = "Project name must be at least 3 characters";
    }
    
    // Team name validation
    if (!formData.teamName.trim()) {
      errors.teamName = "Team name is required";
    }
    
    // URL validations
    if (!formData.prodUrl.trim()) {
      errors.prodUrl = "Production URL is required";
    } else if (!isValidUrl(formData.prodUrl)) {
      errors.prodUrl = "Please enter a valid URL (including http:// or https://)";
    }
    
    if (formData.preprodUrl && !isValidUrl(formData.preprodUrl)) {
      errors.preprodUrl = "Please enter a valid URL (including http:// or https://)";
    }
    
    if (formData.pgUrl && !isValidUrl(formData.pgUrl)) {
      errors.pgUrl = "Please enter a valid URL (including http:// or https://)";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous feedback
    setFormFeedback({ message: "", type: "" });
    
    // Validate form
    if (!validateForm()) {
      setFormFeedback({
        message: "Please correct the errors in the form",
        type: "error"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const requestBody = {
        projectname: formData.projectName,
        team_name: formData.teamName,
        prod_url: formData.prodUrl,
        pre_prod_url: formData.preprodUrl || null,
        pg_url: formData.pgUrl || null
      };
      
      let response, responseData;
      
      if (editProject) {
        // Update existing project
        response = await fetch(`${BASE_API}/projects/update/${editProject.uuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          // Improved error handling
          const errorText = await response.text();
          let errorDetail;
          
          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            errorDetail = errorData.detail || "Failed to update project";
          } catch (e) {
            // If not JSON, use the raw text
            errorDetail = errorText || `Server returned ${response.status}`;
          }
          
          throw new Error(errorDetail);
        }
        
        responseData = await response.json();
        
        // Update projects list
        setProjects(prev => 
          prev.map(proj => 
            proj.uuid === editProject.uuid ? responseData : proj
          )
        );
        
        setFormFeedback({
          message: "Project updated successfully!",
          type: "success"
        });
      } else {
        // Create new project
        response = await fetch(`${BASE_API}/projects/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          // Fix error handling logic
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            // Handle specific error formats
            if (errorData.detail) {
              throw new Error(errorData.detail);
            } else {
              throw new Error(JSON.stringify(errorData));
            }
          } else {
            // Handle non-JSON responses
            const errorText = await response.text();
            throw new Error(errorText || `Server error: ${response.status}`);
          }
        }
        
        responseData = await response.json();
        
        // Add to projects list
        onAddProject(responseData);
        
        setFormFeedback({
          message: "Project added successfully!",
          type: "success"
        });
      }
      
      // Reset form
      setFormData({
        projectName: "",
        teamName: "",
        prodUrl: "",
        preprodUrl: "",
        pgUrl: ""
      });
      
      // Close edit form after success
      if (editProject) {
        setTimeout(() => setEditProject(null), 1000);
      }
      
    } catch (error) {
      console.error("Form submission error:", error);
      
      // Improved error display
      let errorMessage = "An error occurred while processing your request";
      
      if (typeof error.message === 'string') {
        // Try to handle case where error message is stringified JSON
        try {
          if (error.message.startsWith('{') || error.message.startsWith('[')) {
            const parsedError = JSON.parse(error.message);
            errorMessage = parsedError.detail || JSON.stringify(parsedError);
          } else {
            errorMessage = error.message;
          }
        } catch (e) {
          errorMessage = error.message;
        }
      }
      
      setFormFeedback({
        message: errorMessage,
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function for feedback message styling
  const getFeedbackStyles = () => {
    return formFeedback.type === "success"
      ? "bg-green-50 text-green-800 border-green-500"
      : "bg-red-50 text-red-800 border-red-500";
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {editProject ? "Edit Project" : "Add New Project"}
      </h2>
      
      {formFeedback.message && (
        <div className={`mb-4 p-3 border-l-4 ${getFeedbackStyles()}`}>
          {formFeedback.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name*
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.projectName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.projectName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.projectName}</p>
          )}
        </div>
        
        {/* Team Name */}
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name*
          </label>
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.teamName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.teamName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.teamName}</p>
          )}
        </div>
        
        {/* Production URL */}
        <div>
          <label htmlFor="prodUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Production URL*
          </label>
          <input
            type="text"
            id="prodUrl"
            name="prodUrl"
            value={formData.prodUrl}
            onChange={handleInputChange}
            placeholder="https://api.example.com/swagger.json"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.prodUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.prodUrl && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.prodUrl}</p>
          )}
        </div>
        
        {/* Pre-Production URL */}
        <div>
          <label htmlFor="preprodUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Pre-Production URL (Optional)
          </label>
          <input
            type="text"
            id="preprodUrl"
            name="preprodUrl"
            value={formData.preprodUrl}
            onChange={handleInputChange}
            placeholder="https://preprod-api.example.com/swagger.json"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.preprodUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.preprodUrl && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.preprodUrl}</p>
          )}
        </div>
        
        {/* Playground URL */}
        <div>
          <label htmlFor="pgUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Playground URL (Optional)
          </label>
          <input
            type="text"
            id="pgUrl"
            name="pgUrl"
            value={formData.pgUrl}
            onChange={handleInputChange}
            placeholder="https://pg-api.example.com/swagger.json"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.pgUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.pgUrl && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.pgUrl}</p>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          {editProject && (
            <button
              type="button"
              onClick={() => setEditProject(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md ml-auto ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path d="M4 12a8 8 0 018-8" fill="currentColor" />
                </svg>
                Processing...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;


