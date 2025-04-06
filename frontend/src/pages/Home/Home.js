import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swagger from "../../components/Swagger";
import ProjectsPanel from "../../components/ProjectsPanel";
import AddProjectForm from "../../components/AddProjects";
import { BASE_API } from "../../utils/baseApi";

const Home = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const [addProject, setAddProject] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh projects data
  const refreshProjects = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Update selectedProject when projects change or URL param changes
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.uuid === projectId);
      if (project) {
        setSelectedProject(project);
      } else {
        // Reset selectedProject if no matching project found
        setSelectedProject(null);
      }
    } else {
      // Reset selectedProject if no projectId in URL
      setSelectedProject(null);
    }
  }, [projectId, projects]);

  // Enhanced handler for adding projects
  const handleAddProject = (newProject) => {
    setProjects(prev => {
      const updated = [...prev, newProject];
      // If this is the currently selected project, update selectedProject
      if (projectId === newProject.uuid) {
        setSelectedProject(newProject);
      }
      return updated;
    });
    
    setAddProject(false);
    setEditProject(null);
    refreshProjects();
  };

  // Enhanced handler for updating projects
  const handleUpdateProject = (updatedProject) => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.uuid === updatedProject.uuid ? updatedProject : p
      );
      
      // If this is the currently selected project, update selectedProject
      if (projectId === updatedProject.uuid) {
        setSelectedProject(updatedProject);
      }
      
      return updated;
    });
    
    setAddProject(false);
    setEditProject(null);
  };

  // Enhanced handler for editing projects
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

  return (
    <div className="flex min-h-[95vh]">
      <ProjectsPanel 
        setAddProject={setAddProject} 
        projects={projects} 
        setProjects={setProjects} 
        handleEdit={handleEdit} 
        setEditProject={setEditProject}
        refreshKey={refreshKey}
        setSelectedProject={setSelectedProject}
      />
      <div className="w-full p-4 flex justify-center items-center">
        <Swagger selectedProject={selectedProject} />
      </div>

      {addProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <AddProjectForm 
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject} // Add this new prop for updates
            editProject={editProject} 
            setEditProject={setEditProject} 
            setProjects={setProjects} 
            addProject={addProject}
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