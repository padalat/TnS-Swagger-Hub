import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
import { FiMoreVertical } from "react-icons/fi";

const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(true); // Open by default
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const currentId = searchParams.get("id");
  const navigate = useNavigate();
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // const res = await fetch(`${BASE_API}/projects/get/all`);
        const teamName = "TnS"; // Replace with the actual team name, or get it from state/context
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
  }, []);

  const handleEdit = (project) => {
    setAddProject({
      isEditing: true,
      projectData: {
        name: project.projectname,
        pre_prod_url: project.pre_prod_url || "",
        prod_url: project.prod_url || "",
        pg_url: project.pg_url || "",
        uuid: project.uuid,
      },
    });
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
    } catch (error) {
      console.error("Error deleting project:", error);
    }
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
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
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
          <ul>
            {error ? (
              <ErrorMessage error={error} />
            ) : (
              projects.map((project, index) => (
                <li
                  key={index}
                  className={`p-3 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02] ${
                    search && search.toLowerCase() === project.projectname.toLowerCase() ? "bg-blue-200" : ""
                  }`}
                  onClick={() => navigate(`?id=${project.uuid}`)}
                >
                  <span className="font-medium">{project.projectname}</span>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(project)
                        handleEdit(project);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletePrompt(project);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <ul>
          {(projects.length === 0) && (
                  <p className="p-2 text-center">No projects found</p>
                )}
          </ul>
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
