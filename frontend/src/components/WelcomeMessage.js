import React, { useState, useEffect } from "react";
import { BASE_API } from "../utils/baseApi";
import Loader from "./Loader";

const WelcomeMessage = () => {
  const [activities, setActivities] = useState([]);
  const [registeredProjects, setRegisteredProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_API}/activities/recent?k=5`), // Corrected to fetch 5 recent activities
      fetch(`${BASE_API}/statistics`),
    ])
      .then(([resActivities, resStats]) => {
        if (!resActivities.ok || !resStats.ok) {
          throw new Error("HTTP error!");
        }
        return Promise.all([resActivities.json(), resStats.json()]);
      })
      .then(([activitiesData, statsData]) => {
        setActivities(activitiesData || []);
        setRegisteredProjects(statsData.registered_projects || 0);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 text-center shadow-lg">
        <h1 className="text-4xl font-bold">Welcome to FlipDocs</h1>
        <p className="text-lg mt-2">Crafting Innovative API Journeys</p>
      </div>

      {/* Registered Projects Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Registered Projects</h3>
        <div className="text-center">
          <h2 className="text-4xl font-bold text-blue-600">{registeredProjects}</h2>
          <p className="text-sm text-gray-600 mt-2">Total Registered Projects</p>
        </div>
      </div>

      {/* Recent Activity Section */}
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
      ) : activities.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
          <ul className="text-gray-600">
            {activities.map((activity) => (
              <li key={activity.uuid} className="py-3">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-sm text-gray-800">{activity.message}</span>
                  <span className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent API Activity</h3>
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default WelcomeMessage;
