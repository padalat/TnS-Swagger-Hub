import React, { useState, useEffect } from 'react';
import { BASE_API } from '../../utils/baseApi';
import AddProjectForm from '../../components/AddProjectForm';

const AddProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const teamName = "TNS"; // Default to TNS team
  
  // Load existing projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_API}/projects/get/all?team_name=${encodeURIComponent(teamName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const handleAddProject = (newProject) => {
    setProjects(prev => [...prev, newProject]);
  };
  
  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`${BASE_API}/projects/delete/${projectId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      setProjects(prev => prev.filter(project => project.uuid !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project: ' + err.message);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
        <p className="text-gray-600 mt-2">Add or edit API projects</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <AddProjectForm
                onAddProject={handleAddProject}
                editProject={editProject}
                setEditProject={setEditProject}
                setProjects={setProjects}
              />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Projects</h2>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-xl shadow-md p-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-600">No projects found. Add your first project!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {projects.map(project => (
                  <li key={project.uuid} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{project.projectname}</h3>
                        <p className="text-sm text-gray-500">{project.team_name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditProject(project)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.uuid)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProjects;