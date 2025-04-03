import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_API } from '../../utils/baseApi';

// Custom project card component 
const ProjectCard = ({ project }) => {
  const getEnvironmentLabel = (envKey) => {
    const labels = {
      'prod_url': { name: 'Production', color: 'bg-green-100 text-green-800' },
      'pre_prod_url': { name: 'Pre-Prod', color: 'bg-orange-100 text-orange-800' },
      'pg_url': { name: 'Playground', color: 'bg-indigo-100 text-indigo-800' }
    };
    
    return labels[envKey] || { name: envKey, color: 'bg-gray-100 text-gray-800' };
  };
  
  // Collect available environments
  const availableEnvs = [];
  if (project.prod_url) availableEnvs.push('prod_url');
  if (project.pre_prod_url) availableEnvs.push('pre_prod_url');
  if (project.pg_url) availableEnvs.push('pg_url');
  
  return (
    <Link 
      to={`/swagger?id=${project.uuid}&env=prod_url`}
      className="block border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
    >
      {/* Added image */}
      <img 
        src="https://picsum.photos/seed/picsum/200/300" 
        alt="Project visual" 
        className="w-full h-40 object-cover rounded-md mb-3"
      />
      <h3 className="font-semibold text-lg text-gray-900 mb-1">{project.projectname}</h3>
      
      {/* Environment badges */}
      <div className="flex flex-wrap gap-2 mt-2 mb-3">
        {availableEnvs.map(env => {
          const label = getEnvironmentLabel(env);
          return (
            <Link 
              key={env}
              to={`/swagger?id=${project.uuid}&env=${env}`}
              className={`text-xs px-2 py-1 rounded-full ${label.color}`}
              onClick={(e) => e.stopPropagation()}
            >
              {label.name}
            </Link>
          );
        })}
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <Link 
          to={`/project/${project.uuid}`}
          className="text-blue-600 text-sm hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Project Details
        </Link>
        
        <a 
          href={project.prod_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Raw Spec ↗
        </a>
      </div>
    </Link>
  );
};

// Main project list component
const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [teamName, setTeamName] = useState("TNS"); // Default to TNS team
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Fetch projects directly - no teams API required
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Call the projects API directly with team name
        const response = await fetch(`${BASE_API}/projects/get/all?team_name=${encodeURIComponent(teamName)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects for team ${teamName}`);
        }
        
        const projectsData = await response.json();
        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'An error occurred while loading projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [teamName]);
  
  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.projectname.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;
  
  // Navigate to Swagger UI for selected project
  const openSwaggerUI = (projectId, env = 'prod_url') => {
    navigate(`/swagger?id=${projectId}&env=${env}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <h3 className="text-red-800 font-medium">Error Loading Projects</h3>
        <p className="text-red-700 mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Library</h1>
        <p className="text-gray-600">Browse all available projects and API documentation</p>
      </div>
      
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 0l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Projects display */}
      {filteredProjects.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
          </svg>
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{teamName} Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.uuid} 
                project={project}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;