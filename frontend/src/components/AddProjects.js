import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_API } from "../utils/baseApi";
import Instruction from "./Instruction";
import {AuthContext} from '../contexts/AuthContext'
import { useContext } from "react";
import CsvUpload from "./CsvUpload"; // Use CsvUpload directly

const AddProjectForm = ({ addProject, onAddProject, editProject, setEditProject, setProjects, onClose,allTeams,setAllTeams ,addTeam,setAddTeam,onAddTeam,onUpdateProject, cachedProjects, setCachedProjects,selectedTeam,setSelectedTeam}) => {
  const [projectName, setProjectName] = useState("");
  const [preprodUrl, setPreprodUrl] = useState("");
  const [prodUrl, setProdUrl] = useState("");
  const [pgUrl, setPgUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAdd, setShowAdd] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTeamSelected, setIsTeamSelected] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false); // state for CSV uploader

  const navigate = useNavigate();

  const {token,isAdmin,canRead,canWrite,decoded}=useContext(AuthContext);
  // const [selectedTeam,setSelectedTeam] = useState();
  useEffect(() => {
    const defaultTeam = isAdmin ? "" : decoded?.["team_name"];
    setSelectedTeam(defaultTeam);
    setTeamName(defaultTeam); // pre-fill input, even if hidden
    setIsTeamSelected(!isAdmin); // true only for non-admins
  }, []);
  
 
  useEffect(() => {
    if (addProject?.isEditing && addProject.projectData) {
      setIsEdit(true);
      const data = addProject.projectData;
      setProjectName(data.projectname || "");
      setPreprodUrl(data.pre_prod_url || "");
      setProdUrl(data.prod_url || "");
      setPgUrl(data.pg_url || "");
      setSelectedTeam(data.team_name || "");
      setTeamName(data.team_name || ""); // pre-fill the team search input
      setIsTeamSelected(true);        // mark team as valid so it doesn't trigger error
    } else {
      setIsEdit(false);
      setProjectName("");
      setPreprodUrl("");
      setProdUrl("");
      setPgUrl(""); 
      setSelectedTeam(selectedTeam);
      setTeamName(selectedTeam); // pre-fill the team search input
      setIsTeamSelected(true); 
    }
  }, [addProject]);

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!projectName) {
      setMessage("Team name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/teams/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ team_name: projectName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add team.");
      }

      const data = await response.json();
      setMessage("Team added successfully!");
      setProjectName("");
      onAddTeam(data);

      navigate("/");
      setTimeout(() => {
        setMessage("");
        if (onClose) {
          onClose();
        } else {
          navigate("/");
        }
      }, 0);
      
    } catch (error) {
      console.error("Error adding team:", error);
      setMessage(error.message || "Error processing team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
    if (isAdmin && (!selectedTeam || !isTeamSelected)) {
      setMessage("Please select a valid team from the list.");
      setIsSubmitting(false);
      return;
    }
    

    try {
      let response, data;
      const projectData = {
        projectname: projectName,
        team_name: selectedTeam,
        pre_prod_url: preprodUrl || "",
        prod_url: prodUrl || "",
        pg_url: pgUrl || ""
      };

      if (!projectData.pre_prod_url && !projectData.prod_url && !projectData.pg_url) {
        setMessage("At least one URL must be provided.");
        setIsSubmitting(false);
        return;
      }

      if (isEdit && addProject.projectData.uuid) {
        const projectUuid = addProject.projectData.uuid;
        response = await fetch(`${BASE_API}/projects/update/${projectUuid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          let errorMessage = "Failed to update project.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        data = await response.json();

        if (setCachedProjects && cachedProjects) {
          setCachedProjects(prev => {
            const updated = { ...prev };
            const team = data.team_name;
            if (updated[team]) {
              updated[team] = updated[team].map(p =>
                p.uuid === data.uuid ? data : p
              );
            }
            return updated;
          });
        }

        // Call the update handler passed from ProjectsPanel
        // if (typeof onUpdateProject === "function") {
        //   onUpdateProject(data);
        // }

        setMessage("Project updated successfully!");
      } else {
        response = await fetch(`${BASE_API}/projects/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to add project.");
        }

        data = await response.json();

        if (setCachedProjects) {
          setCachedProjects(prev => {
            const updated = { ...prev };
            const team = data.team_name;
            if (!updated[team]) updated[team] = [];
            updated[team] = [...updated[team], data];
            return updated;
          });
        }
        
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

  const toggleInstructions = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInstructions(prev => !prev);
  };

  return (
    <div className="relative flex flex-col items-center p-6 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {showCsvUpload ? (
          // If CSV upload is toggled then render only the CSV upload interface
          <div>
            <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>
            <CsvUpload onClose={onClose} />
            
          </div>
        ) : (
          // Otherwise render the default form with CSV Upload toggle button included
          <>
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Project" : isAdmin ? "Choose Action" : "Add Project"}
            </h2>
            {!isEdit && (isAdmin || canWrite) && (
              <div className="mb-4 flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => {
                    setShowAdd(true);
                    setProjectName("");
                    setPreprodUrl("");
                    setProdUrl("");
                    setPgUrl("");
                    setShowInstructions(false);
                  }}
                >
                  Add New Project
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => {
                    setShowAdd(false);
                    setProjectName("");
                    setPreprodUrl("");
                    setProdUrl("");
                    setPgUrl("");
                    setShowInstructions(false);
                  }}
                >
                  Add New Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvUpload(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  CSV Upload
                </button>
              </div>
            )}
            {message && (
              <div className={`p-3 mb-4 rounded ${
                message.includes("Error") || message.includes("Failed")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {message}
              </div>
            )}

            {showAdd ? (
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
                
                {(isAdmin) && (<div className="relative">
                  <label htmlFor="teamSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Team *
                  </label>
                  <input
                    type="text"
                    id="teamSearch"
                    placeholder="Search team..."
                    value={teamName} // Changed from selectedTeam to teamName to make it editable
                    onChange={(e) => {
                      setTeamName(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="on"
                  />

                  {showDropdown && teamName && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md max-h-40 overflow-y-auto shadow-lg">
                      {allTeams
                        .filter((team) =>
                          team.team_name.toLowerCase().includes(teamName.toLowerCase())
                        )
                        .map((team) => (
                          <li
                            key={team.team_id}
                            onClick={() => {
                              setSelectedTeam(team.team_name);
                              setTeamName(team.team_name);
                              setIsTeamSelected(true); 
                              setShowDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                          >
                            {team.team_name}
                          </li>

                        ))}
                    </ul>
                  )}
                </div>)
                }



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
            ) : (
              <form className="space-y-4" onSubmit={handleAddTeam}>
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    placeholder="Enter team name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
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
                    Add Team
                  </button>
                </div>
                

              </form>
            )}
          </>
        )}
      </div>

      {showInstructions && (
        <Instruction onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

export default AddProjectForm;
