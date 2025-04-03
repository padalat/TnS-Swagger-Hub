import React, { useState, useEffect } from "react";
import { BASE_API } from "../../utils/baseApi";

const AddProjectForm = ({ onAddProject, editProject, setEditProject, setProjects }) => {
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [preprodUrl, setPreprodUrl] = useState("");
  const [prodUrl, setProdUrl] = useState("");
  const [pgUrl, setPgUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editProject) {
      setProjectName(editProject.projectname || "");
      setProjectUrl(editProject.projecturl || "");
      setPreprodUrl(editProject.preprodUrl || "");
      setProdUrl(editProject.prodUrl || "");
      setPgUrl(editProject.pgUrl || "");
    }
  }, [editProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !projectUrl) {
      setMessage("Project Name and URL are required.");
      return;
    }

    try {
      let response, data;
      console.log(editProject)
      
      if (editProject) {
        response = await fetch(`${BASE_API}/projects/update/${editProject.uuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectname: projectName,
            projecturl: projectUrl,
            preprodUrl,
            prodUrl,
            pgUrl,
          }),
        });

        if (!response.ok) throw new Error("Failed to update project.");
        
        setProjects((prev) =>
          prev.map((proj) =>
            proj.uuid === editProject.uuid
              ? { ...proj, projectname: projectName, projecturl: projectUrl, preprodUrl, prodUrl, pgUrl }
              : proj
          )
        );
        setMessage("Project updated successfully!");
      } else {
        response = await fetch(`${BASE_API}/projects/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectname: projectName,
            projecturl: projectUrl,
            preprodUrl,
            prodUrl,
            pgUrl,
          }),
        });

        data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to add project.");

        onAddProject({ projectname: projectName, projecturl: projectUrl, preprodUrl, prodUrl, pgUrl, uuid: data.uuid });

        setMessage("Project added successfully!");
      }

      // Reset Form & Close Editor
      setProjectName("");
      setProjectUrl("");
      setPreprodUrl("");
      setProdUrl("");
      setPgUrl("");
      setTimeout(() => {
        setMessage("");
        setEditProject(null);
      }, 1000);
    } catch (error) {
      setMessage(error.message || "Error processing project. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{editProject ? "Edit Project" : "Add New Project"}</h2>

        {/* Project Name & URL fields (shown in both Add & Edit mode) */}
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <input
          type="text"
          placeholder="Project URL"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* Extra Fields in Edit Mode */}
        {editProject && (
          <>
            <input type="text" placeholder="Preprod URL" value={preprodUrl} onChange={(e) => setPreprodUrl(e.target.value)} className="w-full border p-2 rounded mb-3" />
            <input type="text" placeholder="Prod URL" value={prodUrl} onChange={(e) => setProdUrl(e.target.value)} className="w-full border p-2 rounded mb-3" />
            <input type="text" placeholder="PG URL" value={pgUrl} onChange={(e) => setPgUrl(e.target.value)} className="w-full border p-2 rounded mb-3" />
          </>
        )}

        <button onClick={handleSubmit} className="w-full p-2 mt-4 bg-blue-500 text-white rounded">{editProject ? "Update Project" : "Add Project"}</button>

        {message && <p className="mt-2 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default AddProjectForm;


