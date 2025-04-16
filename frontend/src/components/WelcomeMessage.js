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
  const [animatedText, setAnimatedText] = useState([]);

  const { token } = useContext(AuthContext);

  // Fetch recent activities and statistics when component mounts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_API}/activities/recent?k=3`, {
        "headers": {
          "Authorization": `Bearer ${token}`
        }
      }),
      fetch(`${BASE_API}/statistics`, {
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

  // Animate "FlipDocs" text letter by letter with fade-in effect
  useEffect(() => {
    const text = "FlipDocs";
    let index = -1;
    setAnimatedText([]); // Reset the animated text before starting
    const interval = setInterval(() => {
      setAnimatedText((prev) => [...prev, text[index]]);
      index++;
      if (index >= text.length) clearInterval(interval); // Stop when all letters are displayed
    }, 300); // Adjust speed of animation
    return () => clearInterval(interval);
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
    <div className="flex flex-col gap-8 p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-8 text-center shadow-lg transform transition duration-500 hover:scale-105">
        <h1 className="text-5xl font-extrabold tracking-wide">
          Welcome to{" "}
          <span className="inline-flex">
            {animatedText.map((letter, index) => (
              <span
                key={index}
                className="text-yellow-400 opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.3}s`, // Delay each letter
                  animationFillMode: "forwards", // Ensure the animation persists
                  display: "inline-block",
                  opacity: 1, // Explicitly set opacity to ensure visibility
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </h1>
        <p className="text-lg mt-4 font-light">Your API Documentation Hub</p>
      </div>

      {/* Registered Projects Section */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center transform transition duration-500 hover:scale-105">
        {loading ? (
          <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-blue-600">{stats.registeredProjects}</h2>
            <p className="text-lg text-gray-600 mt-2">Registered Projects</p>
          </>
        )}
      </div>

      {loading ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <p className="text-red-500">{error}</p>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
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
