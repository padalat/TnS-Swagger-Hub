import React, { useState }  from "react";
import Swagger from "../../components/Swagger";
import ProjectsPanel from "../../components/ProjectsPanel";
import AddProjectForm from "../AddProjects/AddProjects";

const Home = () => {
  const [addProject,setAddProject]=useState(false);
  const [projects, setProjects] = useState([]);

  const handleAddProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
    setAddProject(false);
  };
  
  return (
    <div className="flex min-h-[95vh]">
      <ProjectsPanel setAddProject={setAddProject} projects={projects} setProjects={setProjects}/>
      <div className="w-full p-4 flex justify-center items-center">
        <Swagger />
      </div>

      {addProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <AddProjectForm onAddProject={handleAddProject} />
            <button
              onClick={() => setAddProject(false)}
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

export default Home;
