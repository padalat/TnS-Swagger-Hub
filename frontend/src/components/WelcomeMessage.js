import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_API } from '../utils/baseApi';

/**
 * Welcome screen component for when no API documentation is selected
 * Shows recent projects and entry points to project management
 */
const WelcomeMessage = () => {
  // State for recently accessed projects
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Fetch some recent projects to display
  useEffect(() => {
    const getInitialData = async () => {
      try {
        setLoadingProjects(true);
        
        // Get projects directly for TNS team
        const projectsResponse = await fetch(`${BASE_API}/projects/get/all?team_name=TNS`);
        
        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          // Show max 6 recent projects 
          setRecentProjects(projects.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    getInitialData();
  }, []);

  // Get time of day for greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Random motivational message
  const getRandomMotivation = () => {
    const messages = [
      'Ready to explore your APIs today?',
      'Documentation makes integration easier!',
      'Discover the power of your APIs',
      'Let\'s make API integration simpler',
      'Well-documented APIs are a joy to use'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getTimeBasedGreeting()} | TNS Swagger Hub
        </h1>
        <p className="text-xl text-gray-600">{getRandomMotivation()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Get Started</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/projects" className="flex items-center text-blue-700 hover:text-blue-900">
                <span className="mr-2 text-blue-500">→</span>
                Browse all projects
              </Link>
            </li>
            <li>
              <Link to="/add" className="flex items-center text-blue-700 hover:text-blue-900">
                <span className="mr-2 text-blue-500">+</span>
                Add a new project
              </Link>
            </li>
            {/* Teams link removed */}
          </ul>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-600 mb-4">
            Swagger Hub helps you organize, discover, and use your API documentation.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Browse existing API documentation</li>
            <li>• Add new projects with Swagger/OpenAPI specs</li>
            <li>• Interactive testing of API endpoints</li>
            <li>• Share documentation across teams</li>
          </ul>
        </div>
      </div>
      
      {/* Recent projects section */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent APIs</h2>
        
        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-28 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentProjects.map(project => (
              <Link 
                key={project.uuid} 
                to={`/swagger?id=${project.uuid}&env=prod_url`}
                className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow rounded-lg p-4 transition-all"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-blue-700 truncate">{project.projectname}</h3>
                <p className="text-sm text-gray-500 truncate">{project.team_name}</p>
                <div className="mt-2 flex gap-1">
                  {project.prod_url && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Production</span>
                  )}
                  {project.pre_prod_url && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">PreProd</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No recent projects found. Start by adding your first project!</p>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
