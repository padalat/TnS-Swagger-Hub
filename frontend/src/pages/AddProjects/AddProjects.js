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
      "^(https?:\\/\\/)" + // Must start with http:// or https://
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // Domain
      "localhost|" + // Localhost
      "(\\d{1,3}\\.){3}\\d{1,3}|" + // IPv4
      "\\[[a-fA-F\\d:]+\\])" + // IPv6
      "(\\:\\d+)?" + // Port
      "(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // Path
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // Query string
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
      {/* Add Project Form - Blur when Instructions are visible */}
      <div className={`bg-white p-6 rounded-lg shadow-lg w-96 transition ${showInstructions ? "blur-md" : ""}`}>
        <h2 className="text-xl font-bold mb-4">Add New Project</h2>

        {/* Project Name Input */}
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* Project URL Input */}
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
          <FaInfoCircle
            onClick={() => setShowInstructions(true)}
            title="Click for instructions"
            className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 cursor-pointer"
          />
        </div>
        {isValidUrl === false && <p className="text-red-500 text-sm mt-1">Invalid URL format</p>}
        {isValidUrl && <p className="text-green-500 text-sm mt-1">Valid URL</p>}

        {/* Add Button */}
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

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Project URL Instructions</h2>
            <p className="text-gray-600">
              ✅ Your project URL should start with <b>http://</b> or <b>https://</b>. <br />
              ✅ Avoid spaces or special characters in URLs. <br />
              ✅ Example: <span className="text-blue-500">https://example.com</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProjectForm;
