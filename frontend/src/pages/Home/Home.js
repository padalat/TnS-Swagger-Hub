import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swagger from "../../components/Swagger"; // Default export
import ProjectsPanel from "../../components/ProjectsPanel"; // Default export
import AddProjectForm from "../../components/AddProjects"; // Default export
import ErrorMessage from "../../components/ErrorMessage"; // Default export
import { BASE_API } from "../../utils/baseApi";
import { AuthContext } from "../../contexts/AuthContext";

const Home = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const [addProject, setAddProject] = useState(false);
  const [addTeam,setAddTeam]= useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allTeams,setAllTeams]=useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam , setSelectedTeam] = useState(null);
  const { token, decoded, isAdmin, canRead, canWrite } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cachedProjects, setCachedProjects] = useState({}); // New state to cache projects per team
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
        setAllTeams(data.teams || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error.message);
      }
    };
  
    fetchTeams();
  }, []);

  // useEfonUpdateProjectfect(() => {
  //   if (projectId && projects.length > 0) {
  //     const project = projects.find(p => p.uuid === projectId);
  //     if (project) {
  //       setSelectedProject(project);
  //     } else {
  //       setSelectedProject(null);
  //     }
  //   } else {
  //     setSelectedProject(null);
  //   }
  // }, [projectId, projects]);

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
  }


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
      }  };
    setEditProject(project);
    setAddProject(editData);
  };

  if (!isAdmin && !canRead) {
    return <ErrorMessage error="You do not have permission to view this page." />;
  }

  return (
    <div className="flex min-h-[95vh]">
      <ProjectsPanel
        setAddProject={setAddProject}
        projects={projects}
        setProjects={setProjects}
        selectedProject={selectedProject}
        handleEdit={handleEdit}
        setEditProject={setEditProject}
        refreshKey={refreshKey}
        setSelectedProject={setSelectedProject}
        teams={allTeams}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        cachedProjects={cachedProjects}
        setCachedProjects={setCachedProjects} 


      />
      <div className="w-full flex justify-center items-center">
        
        <Swagger selectedProject={selectedProject} />
      </div>

      {(canWrite || isAdmin) && addProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <AddProjectForm
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            editProject={editProject}
            setEditProject={setEditProject}
            setProjects={setProjects}
            addProject={addProject}
            allTeams={allTeams}
            setAllTeams={setAllTeams}
            addTeam={addTeam}
            setAddTeam={setAddTeam}
            onAddTeam={handleAddTeam}
            onClose={() => {
              setAddProject(false);
              setEditProject(null);
              setAddTeam(false);
            }}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam} 
            cachedProjects={cachedProjects} 
            setCachedProjects={setCachedProjects}

          />
        </div>
      )}
    </div>
  );
};

export default Home;
