import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
import { FiMoreVertical } from "react-icons/fi";

const ProjectsPanel = ({ setSelectedProject, projects, setProjects, setAddProject, setEditProject, refreshKey }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(true);
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const teamName = "TnS";
        const res = await fetch(`${BASE_API}/projects/get/all?team_name=${encodeURIComponent(teamName)}`);

        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [refreshKey]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEdit = (project) => {
    setAddProject({
      isEditing: true,
      projectData: {
        uuid: project.uuid,
        projectname: project.projectname,
        pre_prod_url: project.pre_prod_url,
        prod_url: project.prod_url,
        pg_url: project.pg_url,
        team_name: project.team_name || "TnS"
      },
    });
    setActiveMenu(null);
  };

  const handleDelete = async () => {
    if (!deletePrompt) return;
    const projectUuid = deletePrompt.uuid;
    if (confirmText !== deletePrompt.projectname) return alert("Project name does not match!");

    try {
      const res = await fetch(`${BASE_API}/projects/delete/${projectUuid}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete project");
      }
      setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== projectUuid));
      console.log("Project deleted successfully from server.");
      setDeletePrompt(null);
      setConfirmText("");
      navigate("/");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const toggleMenu = (e, projectId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === projectId ? null : projectId);
  };

  const filteredProjects = search
    ? projects.filter((project) =>
        project.projectname.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setAddProject({ isEditing: false })}
              className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
            >
              +
            </button>

            {search && (
              <div className="absolute top-full z-10 left-0 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                {(filteredProjects.length === 0 || projects.length === 0) ? (
                  <p className="p-2">No matching projects</p>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project.uuid}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSearch("");
                        navigate(`?id=${project.uuid}`);
                      }}
                    >
                      {project.projectname}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div
            className="p-3 mb-2 bg-gray-200 select-none rounded-lg cursor-pointer font-bold flex justify-between items-center"
            onClick={() => setShowProjects(!showProjects)}
          >
            <span>TNS Team</span>
            <span className="ml-auto">{showProjects ? "▼" : "▶"}</span>
          </div>

          {showProjects && (
            <ul>
              {error ? (
                <ErrorMessage error={error} />
              ) : (
                projects.map((project) => (
                  <li
                    key={project.uuid}
                    className={`p-3 mb-2 relative  last:mb-0 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02] ${project?.uuid && project.uuid !== currentId ? "z-0" : "z-[20]"}`}
                    onClick={() => {
                      navigate(`?id=${project.uuid}`);
                      setSelectedProject(project);
                    }}
                    style={{
                      backgroundColor: project?.uuid && project.uuid === currentId ? "#e5e7eb" : ""
                    }}
                  >
                    <span className="font-medium">{project.projectname}</span>
                    
                    <div className="relative">
                      <button
                        className={`p-2 rounded-md hover:bg-gray-300 transition-all  ${currentId === project.uuid ? "block" :"hidden"}`}
                        onClick={(e) => toggleMenu(e, project.uuid)}
                      >
                        <FiMoreVertical size={20} />
                      </button>
                      
                      {activeMenu === project.uuid && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-[100] py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors duration-200 flex items-center gap-2 m-0.5 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project);
                            }}
                          >
                            <span className="text-yellow-500">✏️</span> Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors duration-200 flex items-center gap-2 m-0.5 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              setDeletePrompt(project);
                            }}
                          >
                            <span className="text-red-500">🗑️</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))
              )}
              {projects.length === 0 && (
                <p className="p-2 text-center">No projects found</p>
              )}
            </ul>
          )}
        </>
      )}

      {deletePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[400px] text-center">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p>Type <b>{deletePrompt.projectname}</b> to confirm deletion:</p>
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