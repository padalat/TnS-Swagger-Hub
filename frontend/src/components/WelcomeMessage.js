import React from "react";

const WelcomeMessage = () => {
  const stats = {
    totalProjects: 12,
    apiCalls: 1500,
    registeredProjects: 8,
  };

  const recentActivity = [
    "Fixed bug in authentication API",
    "Added new endpoint for user profiles",
    "Updated Swagger documentation for payment API",
  ];

  
  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white  rounded-lg p-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to FlipDocs</h1>
        <p className="text-lg text-gray-600 mt-2">Crafting Innovative API Journeys</p>
      </div>

      {/* Statistics Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="shadow-sm rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">{stats.totalProjects}</h2>
            <p className="text-sm text-gray-600 mt-2">Total Projects</p>
          </div>
          <div className="shadow-sm rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">{stats.registeredProjects}</h2>
            <p className="text-sm text-gray-600 mt-2">Registered Projects</p>
          </div>
          <div className="shadow-sm rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">{stats.apiCalls}</h2>
            <p className="text-sm text-gray-600 mt-2">API Calls</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
        <ul className="list-disc list-inside text-gray-600">
          {recentActivity.map((activity, index) => (
            <li key={index} className="text-sm mb-2">
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WelcomeMessage;
