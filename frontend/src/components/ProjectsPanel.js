import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader"; // Import the Loader component
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
import { FiMoreVertical } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { AuthContext } from '../contexts/AuthContext';

const ProjectsPanel = ({ setSelectedProject, projects, setProjects, setAddProject, setEditProject, refreshKey, teams ,selectedProject, selectedTeam, setSelectedTeam, cachedProjects, setCachedProjects}) => {
  const [search, setSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(null);
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  // const [selectedTeam, setSelectedTeam] = useState();
  const [selectedSearchProject, setSelectedSearchProject] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); 
  const [loadingProjects, setLoadingProjects] = useState(false); // State for loading projects

  const menuRef = useRef(null);
  const teamSearchRef = useRef(null);
  const projectSearchRef = useRef(null);
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  const { token, isAdmin, canRead, canWrite, decoded } = useContext(AuthContext);

  useEffect(() => {
    if (!isAdmin && teams?.length === 0 && decoded?.team_name) {
      setShowProjects(decoded.team_name);
    }
  }, [teams, decoded, isAdmin]);

  // // UseMemo to cache projects for current team
  // const memoizedProjects = useMemo(() => {
  //   return cachedProjects[showProjects];
  // }, [cachedProjects, showProjects]);

  useEffect(() => {
    if (showProjects === null) return;
    // Check if cache has an entry (even if an empty array)
    if (Object.prototype.hasOwnProperty.call(cachedProjects, showProjects)) {
      setProjects(cachedProjects[showProjects]);
      return;
    }
    async function fetchProjects() {
      setLoadingProjects(true);
      try {
        const res = await fetch(`${BASE_API}/projects/team/get/all?team_name=${encodeURIComponent(showProjects)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const sorted = data.sort((a, b) => a.projectname.localeCompare(b.projectname));
        setProjects(sorted);
        // Cache the projects even if sorted is empty
        setCachedProjects(prev => ({ ...prev, [showProjects]: sorted }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [showProjects, token, cachedProjects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleTeamSearchClickOutside = (event) => {
      if (teamSearchRef.current && !teamSearchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleTeamSearchClickOutside);
    return () => document.removeEventListener("mousedown", handleTeamSearchClickOutside);
  }, []);

  useEffect(() => {
    const handleProjectSearchClickOutside = (event) => {
      if (projectSearchRef.current && !projectSearchRef.current.contains(event.target)) {
        setSelectedSearchProject(true);
      }
    };
    document.addEventListener("mousedown", handleProjectSearchClickOutside);
    return () => document.removeEventListener("mousedown", handleProjectSearchClickOutside);
  }, []);

  const handleEdit = (project, e) => {
    if (e) e.stopPropagation();
    setAddProject({
      isEditing: true,
      projectData: {
        uuid: project.uuid,
        projectname: project.projectname,
        pre_prod_url: project.pre_prod_url,
        prod_url: project.prod_url,
        pg_url: project.pg_url,
        team_name: project.team_name || decoded?.team_name,
      },
    });
    setActiveMenu(null);
  };

  const handleDelete = async () => {
    if (!deletePrompt) return;

    if (confirmText !== deletePrompt.projectname) {
      alert("Project name does not match!");
      return;
    }

    try {
      const res = await fetch(`${BASE_API}/projects/delete/${deletePrompt.uuid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");

      // setProjects((prev) => prev.filter((p) => p.uuid !== deletePrompt.uuid));
      setProjects((prev) => {
        const updated = prev.filter((p) => p.uuid !== deletePrompt.uuid);
  
        setCachedProjects((cache) => ({
          ...cache,
          [showProjects]: updated
        }));
  
        return updated;
      });
  
      
      setDeletePrompt(null);
      setConfirmText("");
      navigate("/");
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleMenuClick = (e, projectId) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMenu(activeMenu === projectId ? null : projectId);
  };

  const filteredProjects = search
    ? projects.filter((p) =>
        p.projectname.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-[25%] bg-gray-50 p-5 shadow-xl min-w-[250px]">
     <h2 className="text-xl font-bold mb-5 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Projects</h2>

      {/* Team Search for Admins */}
      {isAdmin && (
        <div className="w-full mb-5 relative" ref={teamSearchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search teams..."
              value={teamSearch}
              onChange={(e) => {
                const val = e.target.value;
                setTeamSearch(val);
                setSelectedTeam("");
                setFilteredTeams(
                  teams.filter((team) =>
                    team.team_name.toLowerCase().includes(val.toLowerCase())
                  )
                );
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="flex-grow p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {(isAdmin) && (
              <button
                onClick={() => setAddProject({ isEditing: false })}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex justify-center items-center hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm"
              >
                <span className="text-xl">+</span>
              </button>
            )}
          </div>

          {/* Dropdown for team search results */}
          {showDropdown && teamSearch && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-auto z-10">
              {filteredTeams.length === 0 ? (
                <p className="p-3 text-gray-500">No matching teams</p>
              ) : (
                filteredTeams.map((team) => (
                  <div
                    key={team.team_id}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setTeamSearch(team.team_name);
                      setSelectedTeam(team.team_name);
                      setShowDropdown(false);
                      setShowProjects(team.team_name);
                    }}
                  >
                    {team.team_name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Project Search - Only shown after team selection */}
      {(isAdmin && showProjects) || (!isAdmin && decoded?.team_name) ? (
        <div className="w-full mb-5 relative" ref={projectSearchRef}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Search Projects in {showProjects || decoded?.team_name}
              </label>
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Team Selected
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedSearchProject(false);
                }}
                onFocus={() => {
                  setSelectedSearchProject(false);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm pr-10"
              />
              {search && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <span className="text-xl">×</span>
                </button>
              )}
              {(!isAdmin && canWrite) && (
              <button
                onClick={() => setAddProject({ isEditing: false })}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex justify-center items-center hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm"
              >
                <span className="text-xl">+</span>
              </button>
            )}
            </div>

            {/* Project search results dropdown */}
            {search && !selectedSearchProject && (
              <div className="absolute top-full z-[30] left-0 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-auto">
                {filteredProjects.length === 0 ? (
                  <p className="p-3 text-gray-500">No matching projects</p>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project.uuid}
                      className="p-3 hover:bg-blue-50 cursor-pointer  border-b border-gray-100"
                      onClick={() => {
                        setSelectedSearchProject(true);
                        setSearch(project.projectname);
                        navigate(`?id=${project.uuid}`);
                        setSelectedProject(project);
                      }}
                    >
                      {project.projectname}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : isAdmin ? (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-5 text-center text-gray-500">
          Select a team to search for projects
        </div>
      ) : null}

      {/* Team + Projects UI */}
      <div >
        {teams?.length > 0 ? (
          teams.map((team) => (
            <div key={team.team_id} className="mb-4">
              <div
                className={`p-3 mb-3 ${showProjects === team.team_name ? "bg-blue-100" : "bg-gray-200"} rounded-lg cursor-pointer font-bold flex justify-between items-center select-none pl-4`}
                onClick={() => {
                  setShowProjects((prev) => (prev === team.team_name ? null : team.team_name));
                  setSelectedTeam(team.team_name);
                }}
              >
                <span className={showProjects === team.team_name ? "text-blue-800" : ""}>{team.team_name}</span>
                <span className="ml-auto">{showProjects === team.team_name ? "▼" : "▶"}</span>
              </div>

              {showProjects === team.team_name && (
                loadingProjects ? (
                  <div className="flex justify-center items-center my-4">
                    <Loader />
                  </div>
                ) : (
                  <ul className="pl-4 space-y-2">
                    {error ? (
                      <ErrorMessage error={error} />
                    ) : (
                      projects.length > 0 ? (
                        projects.map((project) => (
                          <li
                            key={project.uuid}
                            className={`p-3 mb-2 relative flex justify-between items-center border ${project?.uuid === currentId ? "border-blue-300 bg-blue-50" : "border-gray-200"} rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                              project?.uuid === currentId ? "z-[20]" : "z-0"
                            }`}
                            onClick={() => {
                              navigate(`?id=${project.uuid}`);
                              setSelectedProject(project);
                              setSelectedTeam(team.team_name);
                            }}
                          >
                            <span className="font-medium truncate flex-1">{project.projectname}</span>

                            {(isAdmin || canWrite) && (
                              <div className="relative">
                                <button
                                  className={`p-2 rounded-md hover:bg-blue-200 transition-all ${
                                    currentId === project.uuid ? "block" : "hidden"
                                  }`}
                                  onClick={(e) => handleMenuClick(e, project.uuid)}
                                >
                                  <FiMoreVertical size={20} className="text-blue-600" />
                                </button>

                                {activeMenu === project.uuid && (
                                  <div
                                    ref={menuRef}
                                    className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 flex items-center gap-2 m-0.5 rounded-md"
                                      onClick={(e) => handleEdit(project, e)}
                                    >
                                      <span className="text-yellow-500">
                                        <CiEdit size={20} />
                                      </span>{" "}
                                      Edit
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-700 flex items-center gap-2 m-0.5 rounded-md"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(null);
                                        setDeletePrompt(project);
                                      }}
                                    >
                                      <span className="text-red-500">
                                        <MdDeleteOutline size={20} />
                                      </span>{" "}
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <p className="p-3 text-center text-gray-500 bg-white rounded-lg shadow-sm">No projects found</p>
                      )
                    )}
                  </ul>
                )
              )}
            </div>
          ))
        ) : (
          <p className="text-center mt-6 text-gray-500 italic p-4 bg-white rounded-lg shadow-sm">No team access.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[30]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
            <div className="bg-red-50 p-4 mb-4 rounded-lg border border-red-200">
              <p className="text-gray-700">
                Type <b className="text-red-600">{deletePrompt.projectname}</b> to confirm deletion:
              </p>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
            <div className="flex justify-between mt-6 gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                onClick={() => setDeletePrompt(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPanel;
