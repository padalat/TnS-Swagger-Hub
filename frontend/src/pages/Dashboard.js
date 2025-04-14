import React, { useState, useEffect } from "react";
import { BASE_API } from "../utils/baseApi";
import { motion } from "framer-motion"; 
import Loader from "../components/Loader";

const Dashboard = () => {
  const [registeredProjects, setRegisteredProjects] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_API}/statistics`),
      fetch(`${BASE_API}/activities/recent?k=5`), 
    ])
      .then(([resStats, resActivities]) => {
        if (!resStats.ok || !resActivities.ok) {
          throw new Error("Failed to fetch data");
        }
        return Promise.all([resStats.json(), resActivities.json()]);
      })
      .then(([statsData, activitiesData]) => {
        setRegisteredProjects(statsData.registered_projects || 0);
        setActivities(activitiesData || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6">
     
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          FlipDocs
        </h1>
        <p className="text-lg text-gray-200 mt-2">
          API documentation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
       
        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition-shadow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Registered Projects
          </h3>
          <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">
            {registeredProjects}
          </p>
        </motion.div>

        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Recent API Activity
          </h3>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : activities.length > 0 ? (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li
                  key={activity.uuid}
                  className="flex justify-between items-center text-gray-700 dark:text-gray-300"
                >
                  <span className="font-medium">{activity.message}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No recent activity</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;