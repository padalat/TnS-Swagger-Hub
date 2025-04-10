import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_API } from "../utils/baseApi";
import Instruction from "./Instruction";


const AddProjectForm = ({ addProject, onAddProject, editProject, setEditProject, setProjects, onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [preprodUrl, setPreprodUrl] = useState("");
  const [prodUrl, setProdUrl] = useState("");
  const [pgUrl, setPgUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (addProject?.isEditing && addProject.projectData) {
      setIsEdit(true);
      const data = addProject.projectData;
      setProjectName(data.projectname || "");
      setPreprodUrl(data.pre_prod_url || "");
      setProdUrl(data.prod_url || "");
      setPgUrl(data.pg_url || "");
    } else {
      setIsEdit(false);
      setProjectName("");
      setPreprodUrl("");
      setProdUrl("");
      setPgUrl("");
    }
  }, [addProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!projectName) {
      setMessage("Project name is required.");
      setIsSubmitting(false);
      return;
    }
    if (!preprodUrl && !prodUrl && !pgUrl) {
      setMessage("At least one URL is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      let response, data;
      const projectData = {
        projectname: projectName,
        team_name: "TnS",
        pre_prod_url: preprodUrl || "", // Use empty string instead of null
        prod_url: prodUrl || "",        // Use empty string instead of null
        pg_url: pgUrl || ""             // Use empty string instead of null
      };

      // Make sure at least one URL is non-empty
      if (!projectData.pre_prod_url && !projectData.prod_url && !projectData.pg_url) {
        setMessage("At least one URL must be provided.");
        setIsSubmitting(false);
        return;
      }

      if (isEdit && addProject.projectData.uuid) {
        // For editing existing project
        const projectUuid = addProject.projectData.uuid;
        
        // Log the data being sent for debugging
        console.log("Updating project with data:", projectData);
        
        response = await fetch(`${BASE_API}/projects/update/${projectUuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });

        // Log the response status for debugging
        console.log("Update response status:", response.status);

        if (!response.ok) {
          let errorMessage = "Failed to update project.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use the status text
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        data = await response.json();
        setProjects((prev) => prev.map((proj) => proj.uuid === projectUuid ? data : proj));
        setMessage("Project updated successfully!");
      } else {
        response = await fetch(`${BASE_API}/projects/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to add project.");
        }

        data = await response.json();
        onAddProject ? onAddProject(data) : setProjects(prev => [...prev, data]);
        navigate("/");
        setMessage("Project added successfully!");
      }

      setProjectName("");
      setPreprodUrl("");
      setProdUrl("");
      setPgUrl("");

      setTimeout(() => {
        setMessage("");
        if (onClose) {
          onClose();
        } else {
          navigate("/");
        }
      }, 0);
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage(error.message || "Error processing project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNameTooltip = () => {
    setShowNameTooltip(prev => !prev);
  };

  const toggleInstructions = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent event bubbling
    setShowInstructions(prev => !prev);
  };

  return (
    <div className="relative flex flex-col items-center p-6 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Project" : "Add New Project"}
        </h2>

        {message && (
          <div className={`p-3 mb-4 rounded ${
            message.includes("Error") || message.includes("Failed") 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center mb-1">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <button 
                type="button"
                onClick={toggleInstructions}
                className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Project information"
              >
                i
              </button>
            </div>
            <input
              id="projectName"
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="prodUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Production URL
            </label>
            <input
              id="prodUrl"
              type="url"
              placeholder="https://api.example.com/swagger.json"
              value={prodUrl}
              onChange={(e) => setProdUrl(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="preprodUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Pre-production URL
            </label>
            <input
              id="preprodUrl"
              type="url"
              placeholder="https://preprod.example.com/swagger.json"
              value={preprodUrl}
              onChange={(e) => setPreprodUrl(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="pgUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Playground URL
            </label>
            <input
              id="pgUrl"
              type="url"
              placeholder="https://playground.example.com/swagger.json"
              value={pgUrl}
              onChange={(e) => setPgUrl(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-red-500 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <Instruction onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

export default AddProjectForm;
