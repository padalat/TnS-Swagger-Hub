import React, { useState, useEffect } from "react";
import { BASE_API } from "../utils/baseApi";
import Loader from "./Loader";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

const WelcomeMessage = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ totalProjects: 60, apiCalls: 1500, registeredProjects: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useContext(AuthContext);

  // Fetch recent activities and statistics when component mounts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_API}/activities/recent?k=3`,{
        "headers": {
          "Authorization": `Bearer ${token}`
        }     
      }),
      fetch(`${BASE_API}/statistics`,{
        "headers": {
          "Authorization": `Bearer ${token}`
        }     
      })
    ])
      .then(([resActivities, resStats]) => {
        if (!resActivities.ok || !resStats.ok) {
          throw new Error("HTTP error!");
        }
        return Promise.all([resActivities.json(), resStats.json()]);
      })
      .then(([activitiesData, statsData]) => {
        setActivities(activitiesData);
        setStats({
          totalProjects: 60,
          apiCalls: 1500,
          registeredProjects: statsData.registered_projects
        });
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  // Format timestamp to readable format (convert from ISO to local time)
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
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

      {/* Recent Activity Section - Only show if there are activities */}
      {loading ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
          <p className="text-red-500">{error}</p>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
          <ul className="text-gray-600">
            {activities.map((activity) => (
              <li key={activity.uuid} className="py-3">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-sm text-gray-800">{activity.message}</span>
                  <span className="text-sm text-gray-500">{formatTimestamp(activity.time)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default WelcomeMessage;
