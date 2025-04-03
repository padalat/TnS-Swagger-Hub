import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_API } from "../../utils/baseApi";

// Custom hook for fetching dashboard statistics
const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    teamsCount: 0,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API call to get dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an actual API call
        // const response = await fetch(`${BASE_API}/stats`);
        // const data = await response.json();
        
        // For now, simulate with mock data
        setTimeout(() => {
          setStats({
            totalProjects: 24,
            activeProjects: 18,
            teamsCount: 5,
            lastUpdated: new Date()
          });
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};

// Custom component for statistic card with uniquely styled gradients
const StatCard = ({ title, value, icon, gradientFrom, gradientTo }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-lg p-3 bg-gradient-to-br from-${gradientFrom}-400 to-${gradientTo}-600`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Unique activity feed component with custom styling
const ActivityFeed = () => {
  // Mock activities data
  const activities = [
    { id: 1, type: 'add', projectName: 'Payment Gateway API', user: 'Alex Kim', time: '2 hours ago' },
    { id: 2, type: 'update', projectName: 'User Authentication Service', user: 'Jordan Lee', time: '5 hours ago' },
    { id: 3, type: 'delete', projectName: 'Legacy Reporting API', user: 'Sam Taylor', time: '1 day ago' },
    { id: 4, type: 'add', projectName: 'Customer Data API', user: 'Casey Morgan', time: '2 days ago' }
  ];

  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'add':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <span className="text-sm">+</span>
          </div>
        );
      case 'update':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <span className="text-sm">⟳</span>
          </div>
        );
      case 'delete':
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <span className="text-sm">✕</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
      </div>
      <div className="px-6 py-4">
        <ul className="divide-y divide-gray-200">
          {activities.map(activity => (
            <li key={activity.id} className="py-3 flex items-start">
              {getActivityIcon(activity.type)}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user} {activity.type === 'add' ? 'added' : activity.type === 'update' ? 'updated' : 'removed'}{' '}
                  <span className="font-semibold">{activity.projectName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Home component with unique layout using CSS Grid
const Home = () => {
  const { stats, isLoading, error } = useDashboardStats();
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the TnS Swagger Hub</p>
      </div>
      
      {/* Quick actions */}
      <div className="mb-8 flex space-x-4">
        <Link 
          to="/add" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="mr-2">+</span>
          Add New Project
        </Link>
        
        <Link 
          to="/upload" 
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
        >
          <span className="mr-2">⬆</span>
          Upload Specification
        </Link>
      </div>
      
      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-5 h-24"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            title="Total Projects" 
            value={stats.totalProjects} 
            icon="📊" 
            gradientFrom="blue" 
            gradientTo="indigo" 
          />
          <StatCard 
            title="Active Projects" 
            value={stats.activeProjects} 
            icon="✓" 
            gradientFrom="green" 
            gradientTo="teal" 
          />
          <StatCard 
            title="Teams" 
            value={stats.teamsCount} 
            icon="👥" 
            gradientFrom="purple" 
            gradientTo="pink" 
          />
        </div>
      )}
      
      {/* Activity feed and quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Quick Access</h3>
            </div>
            <div className="px-6 py-4">
              <ul className="space-y-3">
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="mr-3">🔍</span>
                    Search Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="mr-3">🧩</span>
                    API Explorer
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="mr-3">📘</span>
                    Documentation Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="mr-3">⚙️</span>
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;