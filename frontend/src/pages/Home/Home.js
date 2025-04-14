import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swagger from "../../components/Swagger"; 
import ProjectsPanel from "../../components/ProjectsPanel"; 
import AddProjectForm from "../../components/AddProjects"; 
import ErrorMessage from "../../components/ErrorMessage"; 
import { BASE_API } from "../../utils/baseApi";
import { AuthContext } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

const Home = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const [addProject, setAddProject] = useState(false);
  const [addTeam,setAddTeam]= useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allTeams,setAllTeams]=useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const { token, decoded, isAdmin, canRead, canWrite } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [registeredProjects, setRegisteredProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const navigate = useNavigate();

  const refreshProjects = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${BASE_API}/teams/get/all`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  
        const data = await res.json();
        console.log("data", data)
        setAllTeams(data.teams || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error.message);
      }
    };
  
    fetchTeams();
  }, []);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.uuid === projectId);
      if (project) {
        setSelectedProject(project); 
      } else {
        setSelectedProject(null);
      }
    } else {
      setSelectedProject(null);
    }
  }, [projectId, projects]);

  useEffect(() => {
    setRegisteredProjects(projects.length);
  }, [projects]);

  const handleAddProject = (newProject) => {
    setProjects(prev => {
      const updated = [...prev, newProject];
      if (projectId === newProject.uuid) {
        setSelectedProject(newProject);
      }
      return updated;
    });
    setAddProject(false);
    setEditProject(null);
    refreshProjects();
  };

  const handleAddTeam = (newTeam)=>{
    setAllTeams(prev => {
      const updated = [...prev, newTeam];
      return updated;
    });
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(prev => {
      const updated = prev.map(p =>
        p.uuid === updatedProject.uuid ? updatedProject : p
      );
      if (projectId === updatedProject.uuid) {
        setSelectedProject(updatedProject);
      }
      return updated;
    });
    setAddProject(false);
    setEditProject(null);
  };

  const handleEdit = (project) => {
    const editData = {
      isEditing: true,
      projectData: {
        projectname: project.projectname,
        pre_prod_url: project.pre_prod_url,
        prod_url: project.prod_url,
        pg_url: project.pg_url,
        uuid: project.uuid,
        team_name: project.team_name || "TnS"
      }
    };
    setEditProject(project);
    setAddProject(editData);
  };

  if (!isAdmin && !canRead) {
    return <ErrorMessage error="You do not have permission to view this page." />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <ProjectsPanel
        projects={projects}
        setProjects={setProjects}
        teams={allTeams}
        setAddProject={setAddProject}
        setEditProject={setEditProject}
        setSelectedProject={setSelectedProject} // Pass setSelectedProject correctly
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 relative ${
          selectedProject ? "bg-white" : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
        } p-6`}
      >
        {selectedProject ? (
          // Show Swagger if a project is selected
          <div className="w-full p-4 flex justify-center items-center">
            <Swagger selectedProject={selectedProject} />
          </div>
        ) : (
          <>
            
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
                FlipDocs
              </h1>
              <p className="text-lg text-gray-200 mt-2">
                 API Documentation
              </p>
            </motion.div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
              {/* Registered Projects Card */}
              <motion.div
                className="bg-gradient-to-r from-white to-blue-100 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition-shadow"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Registered Projects
                </h3>
                <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">
                  {registeredProjects}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total number of projects registered in the team.
                </p>
              </motion.div>

              {/* Recent API Activity Card */}
              <motion.div
                className="bg-gradient-to-r from-white to-blue-100 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Recent API Activity
                </h3>
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <ul className="space-y-4">
                    {apiStatus ? (
                      <li className="text-gray-700 dark:text-gray-300 text-center">
                        {apiStatus}
                      </li>
                    ) : (
                      <p className="text-gray-500 text-center">No recent activity</p>
                    )}
                  </ul>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Add Project Modal */}
      {addProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <AddProjectForm
            addProject={addProject}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            editProject={editProject}
            setEditProject={setEditProject}
            setProjects={setProjects}
            allTeams={allTeams}
            setAllTeams={setAllTeams}
            onClose={() => {
              setAddProject(false);
              setEditProject(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
