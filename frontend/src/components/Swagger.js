import React, { useState, useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from "../utils/requestInterceptor";
import Loader from "./Loader";
import WelcomeMessage from "./WelcomeMessage";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";

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
      
      fetch(`${BASE_API}/swagger/get/${selectedProject.uuid}/${encodeURIComponent(selectedEnv.key)}`)
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
      <div className="h-full w-full flex items-center justify-center" style={{ padding: "20px" }}>
        <WelcomeMessage />
      </div>
    );
  }

  return (
    <div className="h-full w-full  " style={{ padding: "20px" }}>
      <div className="flex flex-wrap items-center mb-4 gap-4">
        <div>
          <span className="font-medium">Project:</span>{" "}
          <span className="text-blue-600">{selectedProject.projectname}</span>
          {selectedProject.team_name && (
            <span className="text-gray-500 ml-2">({selectedProject.team_name})</span>
          )}
        </div>

        {availableEnvs.length > 0 && (
          <div className="relative inline-block" id="env-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 py-2 border border-gray-300 rounded bg-white shadow hover:bg-gray-100 flex items-center"
            >
              <span className="mr-1">Environment:</span>
              <span className="font-medium">{selectedEnv?.name.toUpperCase()}</span>
              <span className="ml-2">{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-full">
                {availableEnvs.map((env) => (
                  <li
                    key={env.name}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      env.name === selectedEnv?.name ? "bg-gray-200 font-bold" : ""
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
          <div className="text-red-500">No valid environment URLs found for this project</div>
        )}
      </div>

      {error ? (
        <ErrorMessage error={error} />
      ) : loading ? (
        <Loader />
      ) : swaggerSpec ? (
        <SwaggerUI 
          spec={swaggerSpec} 
          requestInterceptor={enhancedRequestInterceptor}
        />
      ) : selectedEnv ? (
        <Loader />
      ) : (
        <WelcomeMessage />
      )}
    </div>
  );
};

export default SwaggerHub;