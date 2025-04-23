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


  const userTeam = decoded?.["team_name"];

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength)}...`;
    }
    return name;
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
    setError("");
  };


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


    setUploading(true);
    try {

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
      className="bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl p-8 relative border border-blue-100"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-6">
        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 text-center cursor-pointer hover:bg-blue-100 transition-colors mb-4"
          onClick={() => document.getElementById('csv-file-input').click()}
        >
          <div className="text-blue-600 mb-2 text-lg">
            {selectedFile ? `${truncateFileName(selectedFile.name)}` : 'Drag and drop your CSV file here'}
          </div>
          {!selectedFile && (
            <p className="text-sm text-gray-500">
              or click to browse files
            </p>
          )}
        </div>

        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onClose}
          className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium border border-gray-200 shadow-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleUpload}
          className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium shadow-md transition-all"
          disabled={uploading || !selectedFile}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {uploading && (
        <div className="mt-6 flex justify-center">
          <Loader />
        </div>
      )}

      {message && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default CsvUpload;
