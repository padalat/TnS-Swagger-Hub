import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const AddProjectForm = ({ onAddProject }) => {
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const validateUrl = (inputUrl) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)" + 
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + 
      "localhost|" +
      "(\\d{1,3}\\.){3}\\d{1,3}|" + 
      "\\[[a-fA-F\\d:]+\\])" + 
      "(\\:\\d+)?" + 
      "(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + 
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" +
      "(\\#[-a-zA-Z\\d_]*)?$",
      "i"
    );
    return urlPattern.test(inputUrl);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setProjectUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName || !isValidUrl) {
      setMessage("Please enter a valid project name and URL.");
      return;
    }

    onAddProject({ name: projectName, url: projectUrl });
    setProjectName("");
    setProjectUrl("");
    setIsValidUrl(null);
    setMessage("Project added successfully!");
  };

  return (
    <div className="relative flex flex-col items-center p-6">
      <div className={`bg-white p-6 rounded-lg shadow-lg w-96 transition ${showInstructions ? "blur-md" : ""}`}>
        <h2 className="text-xl font-bold mb-4">Add New Project</h2>

        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Project URL"
            value={projectUrl}
            onChange={handleUrlChange}
            className={`w-full border p-2 rounded ${
              isValidUrl === null ? "" : isValidUrl ? "border-green-500" : "border-red-500"
            }`}
          />
          {/* Info Icon (Opens Instructions) */}          
        </div>
        {isValidUrl === false && <p className="text-red-500 text-sm mt-1">Invalid URL format</p>}
        {isValidUrl && <p className="text-green-500 text-sm mt-1">Valid URL</p>}

        <button
          type="submit"
          onClick={handleSubmit}
          className={`w-full p-2 mt-4 rounded ${
            isValidUrl ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isValidUrl}
        >
          Add Project
        </button>

        {message && <p className="mt-2 text-center text-sm text-gray-700">{message}</p>}
      </div>
      {/* Instructions Popup Component */}
    </div>
  );
};
export default AddProjectForm;
