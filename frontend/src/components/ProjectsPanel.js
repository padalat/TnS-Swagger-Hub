import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";

const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(false);
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${BASE_API}/projects/get/all`);
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
        url: project.projecturl,
        preprodUrl: project.preprodUrl || "",
        prodUrl: project.prodUrl || "",
        pgUrl: project.pgUrl || "",
        uuid: project.uuid,
      },
    });
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== uuid));
      console.log("Project deleted successfully from state.");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };
  
  const filteredProjects = search
    ? projects.filter((project) =>
        project.projectname.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

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
                {filteredProjects.length === 0 ? (
                  <p className="p-2 text-gray-500">No matching projects</p>
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

          <div className="mb-4">
            <div
              className="p-3 bg-gray-200 rounded-lg cursor-pointer font-bold"
              onClick={() => setShowProjects(!showProjects)}
            >
              TNS Team {showProjects ? "▼" : "▶"}
            </div>
            {showProjects && (
              <ul className="mt-2">
                {error ? (
                  <ErrorMessage error={error} />
                ) : (
                  filteredProjects.map((project, index) => (
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
                            handleEdit(project);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.uuid);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsPanel;
