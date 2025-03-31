import React, { useState, useEffect } from "react";
import {  useNavigate, useSearchParams } from "react-router-dom";

import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
// import AddProjectForm from "./AddProjectForm";

import AddProjectForm from "../pages/AddProjects/AddProjects";
import { BASE_API } from "../utils/baseApi";

const ProjectsPanel = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
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
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = Array.isArray(projects)
  ? projects.filter((project) =>
      project.projectname.toLowerCase().includes(search.toLowerCase())
    )
  : [];

  const handleAddProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
    setShowModal(false);
  };

  return (
    <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl">
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
            <button
              onClick={() => setShowModal(true)}
              className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
            >
              +
            </button>
          </div>
          <ul>
            {error ? (
              <ErrorMessage error={error} />
            ) : filteredProjects.length === 0 ? (
              <li className="p-2 mb-2 rounded text-center">No projects found</li>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <AddProjectForm onAddProject={handleAddProject} />
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPanel;