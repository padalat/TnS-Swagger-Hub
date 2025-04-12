import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
import { FiMoreVertical } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { AuthContext } from '../contexts/AuthContext';

const ProjectsPanel = ({ setSelectedProject, projects, setProjects, setAddProject, setEditProject, refreshKey, teams }) => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(null);
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  const { token, isAdmin, canRead, canWrite, decoded } = useContext(AuthContext);

  // Set fallback team if user has no visible teams
  useEffect(() => {
    if (!isAdmin && teams?.length === 0 && decoded?.team_name) {
      setShowProjects(decoded.team_name);
    }
  }, [teams, decoded, isAdmin]);

  // Fetch projects when a team is selected
  useEffect(() => {
    if (showProjects === null) return;

    async function fetchProjects() {
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
        setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchProjects();
  }, [showProjects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.uuid !== deletePrompt.uuid));
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
    <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl">
      <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>

      <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(isAdmin || canWrite) && (
          <button
            onClick={() => setAddProject({ isEditing: false })}
            className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
          >
            +
          </button>
        )}
        {search && (
          <div className="absolute top-full z-10 left-0 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
            {filteredProjects.length === 0 ? (
              <p className="p-2">No matching projects</p>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.uuid}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSearch("");
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

      {/* Team Section */}
      {teams?.length > 0 ? (
        teams.map((team) => (
          <div key={team.team_id} className="mb-4">
            <div
              className="p-3 mb-2 bg-gray-200 rounded-lg cursor-pointer font-bold flex justify-between items-center select-none pl-4"
              onClick={() => setShowProjects((prev) => (prev === team.team_name ? null : team.team_name))}
            >
              <span>{team.team_name} Team</span>
              <span className="ml-auto">{showProjects === team.team_name ? "▼" : "▶"}</span>
            </div>

            {showProjects === team.team_name && (
              <ul className="pl-4">
                {error ? (
                  <ErrorMessage error={error} />
                ) : (
                  projects.map((project) => (
                    <li
                      key={project.uuid}
                      className={`p-3 mb-2 relative flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02] ${
                        project?.uuid === currentId ? "z-[20] bg-gray-200" : "z-0"
                      }`}
                      onClick={() => {
                        navigate(`?id=${project.uuid}`);
                        setSelectedProject(project);
                      }}
                    >
                      <span className="font-medium">{project.projectname}</span>

                      {(isAdmin || canWrite) && (
                        <div className="relative">
                          <button
                            className={`p-2 rounded-md hover:bg-gray-300 transition-all ${
                              currentId === project.uuid ? "block" : "hidden"
                            }`}
                            onClick={(e) => handleMenuClick(e, project.uuid)}
                          >
                            <FiMoreVertical size={20} />
                          </button>

                          {activeMenu === project.uuid && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-[100] py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2 m-0.5 rounded-md"
                                onClick={(e) => handleEdit(project, e)}
                              >
                                <span className="text-yellow-500">
                                  <CiEdit size={20} />
                                </span>{" "}
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2 m-0.5 rounded-md"
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
                )}
                {projects.length === 0 && <p className="p-2 text-center">No projects found</p>}
              </ul>
            )}
          </div>
        ))
      ) : (
        <p className="text-center mt-4 text-gray-500 italic">No team access.</p>
      )}

      {/* Delete Confirmation Modal */}
      {deletePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[30]">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[400px] text-center">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p>
              Type <b>{deletePrompt.projectname}</b> to confirm deletion:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setDeletePrompt(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
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
