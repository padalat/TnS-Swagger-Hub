import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_API } from '../../utils/baseApi';
import Notification from '../../components/Notification';
import ConfirmDialog from '../../components/ConfirmDialog';
import SwaggerViewer from '../../components/SwaggerViewer';

const ProjectDetails = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  
  const [projectData, setProjectData] = useState(null);
  const [dataFetchInProgress, setDataFetchInProgress] = useState(true);
  const [apiErrorDetails, setApiErrorDetails] = useState(null);
  const [selectedTabView, setSelectedTabView] = useState('details');
  const [userNotification, setUserNotification] = useState({ content: '', variant: '' });
  const [apiSpecification, setApiSpecification] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);

  const getEnvColor = (env) => {
    switch(env) {
      case 'prod': return 'bg-green-100 text-green-800 border-green-200';
      case 'preprod': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pg': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    const loadProjectDetailsAndSpec = async () => {
      setDataFetchInProgress(true);
      try {
        const projectResponse = await fetch(`${BASE_API}/projects/${uuid}`);
        
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project details');
        }
        
        const projectInfo = await projectResponse.json();
        setProjectData(projectInfo);
        
        if (projectInfo.prod_url) {
          try {
            const swaggerResponse = await fetch(projectInfo.prod_url, {
              headers: { 'Accept': 'application/json' }
            });
            
            if (swaggerResponse.ok) {
              const swaggerDoc = await swaggerResponse.json();
              setApiSpecification(swaggerDoc);
            }
          } catch (swaggerError) {
            console.warn('Swagger specification could not be loaded:', swaggerError);
          }
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setApiErrorDetails(error.message || 'Failed to load project data');
      } finally {
        setDataFetchInProgress(false);
      }
    };
    
    loadProjectDetailsAndSpec();
  }, [uuid]);

  const executeProjectDeletion = async () => {
    setOperationInProgress(true);
    
    try {
      const deleteResponse = await fetch(`${BASE_API}/projects/delete/${uuid}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        throw new Error('Server returned an error when deleting the project');
      }
      
      setUserNotification({
        content: 'Project deleted successfully. Redirecting...',
        variant: 'success'
      });
      
      setTimeout(() => {
        navigate('/add');
      }, 2000);
    } catch (error) {
      console.error('Delete operation failed:', error);
      setUserNotification({
        content: error.message || 'Failed to delete project',
        variant: 'error'
      });
      setOperationInProgress(false);
    } finally {
      setIsConfirmationOpen(false);
    }
  };

  const formatUrl = (url, fallbackText = 'Not configured') => {
    if (!url) return <span className="text-gray-400 italic">{fallbackText}</span>;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {url}
      </a>
    );
  };

  if (dataFetchInProgress) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-500"></div>
          <p className="mt-3 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (apiErrorDetails || !projectData) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v5H9V9zm0-3h2v2H9V6z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700">{apiErrorDetails || 'Project not found'}</p>
        </div>
        <div className="mt-4">
          <Link to="/add" className="text-blue-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {userNotification.content && (
        <div className="mb-6">
          <Notification
            message={userNotification.content}
            type={userNotification.variant}
            onClose={() => setUserNotification({ content: '', variant: '' })}
          />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center">
            <Link to="/add" className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v12a1 1 0 01-2 0V4a1 1 0 011-1z" />
                <path d="M3 10a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z" />
              </svg>
              Back to Projects
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{projectData.name}</h1>
          <p className="text-gray-600">{projectData.description}</p>
        </div>
        <button
          onClick={() => setIsConfirmationOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={operationInProgress}
        >
          Delete Project
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setSelectedTabView('details')}
            className={`py-4 px-1 text-sm font-medium ${
              selectedTabView === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setSelectedTabView('swagger')}
            className={`py-4 px-1 text-sm font-medium ${
              selectedTabView === 'swagger' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Swagger
          </button>
        </nav>
      </div>

      {selectedTabView === 'details' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Project Details</h2>
          <p>{projectData.overview}</p>
        </div>
      )}
      {selectedTabView === 'swagger' && apiSpecification && (
        <div>
          <h2 className="text-xl font-bold mb-4">Swagger Specification</h2>
          <SwaggerViewer spec={apiSpecification} />
        </div>
      )}

      {isConfirmationOpen && (
        <ConfirmDialog
          title="Confirm Deletion"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={executeProjectDeletion}
          onCancel={() => setIsConfirmationOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;