import React, { useState, useContext, useCallback } from "react";
import { BASE_API } from "../utils/baseApi";
import { AuthContext } from "../contexts/AuthContext";
import Loader from "./Loader";
import { uploadCsvFile } from "../utils/csvUploadService";
import { useNavigate } from "react-router-dom";

const CsvUpload = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token, isAdmin, decoded } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // The allowed team for non-admin users
  const userTeam = decoded?.["team_name"];

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  // Basic drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file.");
      return;
    }
    // For non-admins, validate file type if required (optional validation)
    // if (!isAdmin && selectedFile.type !== "text/csv") {
    //   setError(`Only CSV files are allowed for team "${userTeam}"`);
    //   return;
    // }
    
    setUploading(true);
    try {
      // Directly upload the selected file without parsing on frontend
      const result = await uploadCsvFile(selectedFile, token);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message || "File uploaded successfully!");
      setSelectedFile(null);
      onClose();
      navigate('/');
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className="bg-white shadow-inner rounded-lg p-6 relative border border-gray-200"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close CSV Upload"
        >
          &times;
        </button>
      )}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Upload Project CSV</h3>
      <div className="mb-4">
        <label htmlFor="csv-file-input" className="block text-sm font-medium text-gray-700 mb-2">
          Drag and drop file here or click to select CSV
        </label>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button 
        onClick={handleUpload} 
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" 
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {uploading && <Loader />}
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default CsvUpload;
