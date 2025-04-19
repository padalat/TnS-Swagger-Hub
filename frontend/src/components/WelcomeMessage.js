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
    <div className="min-h-screen p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Welcome to FlipDocs
        </h1>
        <p className="text-lg text-gray-600 mt-4">API Documentation</p>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="mb-8">
            <p className="text-5xl font-bold text-gray-700 mt-2">{stats.registeredProjects}</p>
            <p className="text-base text-gray-500 mt-1">Registered Projects</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent API Activity</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : activities && activities.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-w-3xl mx-auto">
                {activities.map((activity) => (
                  <li
                    key={activity.uuid}
                    className="py-3 px-4 hover:bg-gray-100 transition duration-150"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">{activity.message}</span>
                      <span className="text-sm text-gray-500">{formatTimestamp(activity.time)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent activity available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
