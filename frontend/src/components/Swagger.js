import React, { useState, useEffect, useContext } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from "../utils/requestInterceptor";
import Loader from "./Loader";
import WelcomeMessage from "./WelcomeMessage";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
import {AuthContext} from '../contexts/AuthContext'



const ENV_KEYS = {
  prod: "prod_url",
  preprod: "pre_prod_url",
  pg: "pg_url"
};

const SwaggerHub = ({ selectedProject }) => {
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableEnvs, setAvailableEnvs] = useState([]);
  const {token,decoded}=useContext(AuthContext);

  // Calculate available environments whenever selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      const envs = Object.entries(ENV_KEYS)
        .filter(([_, key]) => selectedProject[key] && selectedProject[key].trim())
        .map(([envKey, projectKey]) => ({
          name: envKey,
          key: projectKey,
          url: selectedProject[projectKey]
        }));

      setAvailableEnvs(envs);

      if (envs.length > 0) {
        // Check if currently selected env is still valid
        const currentEnvStillValid = selectedEnv && envs.some(env => env.key === selectedEnv.key);
        if (!currentEnvStillValid) {
          setSelectedEnv(envs[0]);
        }
      } else {
        setSelectedEnv(null);
        setSwaggerSpec(null);
        setError("No valid environment URLs found for this project");
      }
    } else {
      setAvailableEnvs([]);
      setSelectedEnv(null);
      setSwaggerSpec(null);
      setError(null);
    }
  }, [selectedProject]);

  // Fetch Swagger spec when environment changes
  useEffect(() => {
    if (selectedEnv && selectedProject?.uuid) {
      setLoading(true);
      setError(null);
      
      // Verify the environment key exists and has a valid value
      if (!selectedProject[selectedEnv.key]) {
        setError(`No valid URL found for ${selectedEnv.name.toUpperCase()} environment`);
        setLoading(false);
        return;
      }
      
      fetch(`${BASE_API}/swagger/get/${selectedProject.uuid}/${encodeURIComponent(selectedEnv.key)}`, {
        "headers": {
          "Authorization" : `Bearer ${token}`,
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((response) => {
          if (response.swagger) {
            setSwaggerSpec(response.swagger);
          } else {
            throw new Error("No swagger specification found");
          }
        })
        .catch((err) => {
          console.error("Swagger fetch error:", err);
          if (err.message.includes("No swagger")) {
            setError(`No valid Swagger specification found for ${selectedEnv.name.toUpperCase()}`);
          } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            setError(`Cannot connect to the API. Please check your network connection or CORS settings.`);
          } else {
            setError(`Failed to load Swagger spec: ${err.message}`);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [selectedEnv, selectedProject]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("env-dropdown");
      if (dropdown && !dropdown.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle environment change from dropdown
  const handleEnvChange = (env) => {
    setSelectedEnv(env);
    setDropdownOpen(false);
  };

  // Custom request interceptor
  const enhancedRequestInterceptor = (req) => {
    const interceptedReq = requestInterceptor(req);

    if (selectedEnv?.url) {
      const urlMatch = /^(https?:\/\/[^\/]+)/.exec(selectedEnv.url);
      if (urlMatch && urlMatch[1]) {
        const baseUrl = urlMatch[1];
        if (interceptedReq.url.startsWith(baseUrl)) {
          interceptedReq.headers["swagger_url"] = interceptedReq.url;
        }
      }
    }

    return interceptedReq;
  };

  // Render fallback message if no project is selected
  if (!selectedProject) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <WelcomeMessage />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 rounded-lg" style={{ padding: "24px" }}>
      <div className="flex flex-wrap items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 mr-2">Project:</span>
          <span className="text-blue-600 font-bold">{selectedProject.projectname}</span>
          {selectedProject.team_name && (
            <span className="text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
              {selectedProject.team_name}
            </span>
          )}
        </div>

        {availableEnvs.length > 0 && (
          <div className="relative inline-block ml-auto" id="env-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-5 py-2 border border-blue-200 rounded-lg bg-white shadow-sm hover:bg-blue-50 flex items-center transition-colors"
            >
              <span className="mr-1 text-gray-600">Environment:</span>
              <span className="font-medium text-blue-700">{selectedEnv?.name.toUpperCase()}</span>
              <span className="ml-2 text-blue-500">{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <ul className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-full overflow-hidden">
                {availableEnvs.map((env) => (
                  <li
                    key={env.name}
                    className={`px-5 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                      env.name === selectedEnv?.name ? "bg-blue-100 font-bold text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => handleEnvChange(env)}
                  >
                    {env.name.toUpperCase()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {availableEnvs.length === 0 && (
          <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100 ml-auto">
            No valid environment URLs found
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {error ? (
          <ErrorMessage error={error} />
        ) : loading ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : swaggerSpec ? (
          <SwaggerUI 
            spec={swaggerSpec} 
            requestInterceptor={enhancedRequestInterceptor}
          />
        ) : selectedEnv ? (
          <div className="py-10">
            <Loader />
          </div>
        ) : (
          <WelcomeMessage />
        )}
      </div>
    </div>
  );
};

export default SwaggerHub;