import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";

const ProjectsPanel = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // added loading state
  const [searchParams] = useSearchParams();
  const currentId = searchParams.get("id");

  useEffect(() => {
    fetch("http://localhost:8000/getprojects/")
      .then((res) => res.json())
      .then((res) => {
        setProjects(res);
        setLoading(false); // stop loading after data is fetched
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setLoading(false); // stop loading on error
      });
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.projectname.toLowerCase().includes(search.toLowerCase())
  );
  const navigate = useNavigate();

  return (
    <div className="w-[25%] bg-gray-50 p-4 shadow-xl">
      <h2 className="text-lg font-bold mb-4">Projects</h2>
      {loading ? ( // render loading animation when loading
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
            {filteredProjects.map((project, index) => (
              <li
                key={index}
                className={`p-2 ${currentId === project.uuid ? "bg-gray-200" : "bg-gray-50"} border border-gray-200 mb-2 rounded cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => navigate(`?id=${project.uuid}`)}
              >
                {project.projectname}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProjectsPanel;
