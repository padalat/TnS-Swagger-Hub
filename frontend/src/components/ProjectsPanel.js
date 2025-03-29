import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage"; // added import for error handling
import { BASE_API } from "../utils/baseApi";
const ProjectsPanel = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const currentId = searchParams.get("id");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${BASE_API}/projects/get/all`);
        if (!res.ok) { // new res.ok check
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Remove optional chaining; ensure projects is an array
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((project) =>
        project.projectname.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const navigate = useNavigate();

  return (
    <div className="w-[25%] bg-gray-50 p-4 shadow-xl">
      <h2 className="text-lg font-bold mb-4">Projects</h2>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full mb-4 flex justify-center items-center h-[40px] flex gap-[5px]">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link
              to="add"
              className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
            >
              +
            </Link>
          </div>
          <ul>
          {error ? (
            <ErrorMessage error={error} />
          ) : filteredProjects.length === 0 ? (
            <li className="p-2  mb-2 rounded text-center">
              No projects found
            </li>
          ) : (
            filteredProjects.map((project, index) => (
              <li
                key={index}
                className={`p-2 ${currentId === project.uuid ? "bg-gray-200" : "bg-gray-50"} border border-gray-200 mb-2 rounded cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => navigate(`?id=${project.uuid}`)}
              >
                {project.projectname}
              </li>
            ))
          )}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProjectsPanel;
