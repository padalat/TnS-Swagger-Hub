import React, { useState, useEffect } from "react";
import { BASE_API } from "../utils/baseApi";
import Loader from "./Loader";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
import { motion } from "framer-motion";
import { FiActivity, FiPackage, FiCheckCircle, FiUsers, FiGrid } from "react-icons/fi";

const WelcomeMessage = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ totalProjects: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, decoded } = useContext(AuthContext);

  // Fetch recent activities and statistics when component mounts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_API}/activities/recent?k=4`,{
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
          totalProjects: statsData.registered_projects
        });
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [token]);

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
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-xl p-8 mb-8 w-full border-l-4 border-blue-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-opacity-10 bg-blue-100 z-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-100 to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
              Welcome to FlipDocs
            </h1>
            <p className="text-xl text-gray-600 mt-3 max-w-2xl">
              Your centralized platform for API documentation, management, and discovery
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Dashboard Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Cards Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Team Name Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-indigo-100 rounded-full mr-4">
                <FiUsers className="text-indigo-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Your Team</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  {decoded?.team_name || "No Team"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-blue-100 rounded-full mr-4">
                <FiPackage className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Projects</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
          
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white shadow-lg rounded-xl p-6 w-full min-h-[200px] h-fit ">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
              <FiCheckCircle className="text-green-500 mr-2" />
              Recent API Activity
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200 w-full">{error}</p>
              </div>
            ) : activities && activities.length > 0 ? (
              <ul className="space-y-4 overflow-auto" style={{ maxHeight: "calc(100vh - 360px)" }}>
                {activities.map((activity, index) => (
                  <motion.li 
                    key={activity.uuid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="relative border-l-4 border-blue-400 pl-4 py-3 pr-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {activity.message.includes("added") ? "New Project" : 
                           activity.message.includes("updated") ? "Update" : 
                           activity.message.includes("deleted") ? "Removal" : "Activity"}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimestamp(activity.time)}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {activity.message}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-center text-gray-500 p-8">No recent activity found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
