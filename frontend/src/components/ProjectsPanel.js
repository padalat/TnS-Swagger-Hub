
// import React, { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import Loader from "./Loader";
// import ErrorMessage from "./ErrorMessage";
// import { BASE_API } from "../utils/baseApi";

// const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchParams] = useSearchParams();
//   const [showProjects, setShowProjects] = useState(false);
//   const currentId = searchParams.get("id");
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchProjects() {
//       try {
//         const res = await fetch(`${BASE_API}/projects/get/all`);
//         if (!res.ok) {
//           throw new Error(`${res.status}: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProjects();
//   }, []);

  
//   const handleEdit = (project) => {
//     setAddProject({
//       isEditing: true,
//       projectData: {
//         name: project.projectname,
//         url: project.projecturl,
//         preprodUrl: project.preprodUrl || "",
//         prodUrl: project.prodUrl || "",
//         pgUrl: project.pgUrl || "",
//         uuid: project.uuid,
//       },
//     });
//   };

//   const handleDelete = async (uuid) => {
//     if (!window.confirm("Are you sure you want to delete this project?")) return;
//     try {
//       setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== uuid));
//       console.log("Project deleted successfully from state.");
//     } catch (error) {
//       console.error("Error deleting project:", error);
//     }
//   };
//   const filteredProjects = search
//     ? projects.filter((project) =>
//         project.projectname.toLowerCase().includes(search.toLowerCase())
//       )
//     : projects;

//   return (
//     <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl rounded-lg">
//       <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
//             <input
//               type="text"
//               placeholder="Search projects..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={() => setAddProject({ isEditing: false })}
//               className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
//             >
//               +
//             </button>
//             {search && (
//               <div className="absolute top-full left-0 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
//                 {filteredProjects.length === 0 ? (
//                   <p className="p-2 text-gray-500">No matching projects</p>
//                 ) : (
//                   filteredProjects.map((project) => (
//                     <div
//                       key={project.uuid}
//                       className="p-2 hover:bg-blue-100 cursor-pointer"
//                       onClick={() => {
//                         setSearch("");
//                         navigate(`?id=${project.uuid}`);
//                       }}
//                     >
//                       {project.projectname}
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Team Section */}
//           <div className="mb-4">
//             <div
//               className="p-3 bg-gray-200 rounded-lg cursor-pointer font-bold"
//               onClick={() => setShowProjects(!showProjects)}
//             >
//               TNS Team {showProjects ? "▼" : "▶"}
//             </div>
//             {showProjects && (
//               <ul className="mt-2">
//                 {error ? (
//                   <ErrorMessage error={error} />
//                 ) : (
//                   filteredProjects.map((project, index) => (
//                     <li
//                       key={index}
//                       className={`p-3 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02] ${
//                         search && search.toLowerCase() === project.projectname.toLowerCase() ? "bg-blue-200" : ""
//                       }`}
//                       onClick={() => navigate(`?id=${project.uuid}`)}
//                     >
//                       <span className="font-medium">{project.projectname}</span>
//                       <div className="flex gap-2">
//                         <button
//                           className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleEdit(project);
//                           }}
//                         >
//                           ✏️
//                         </button>
//                         <button
//                           className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDelete(project.uuid);
//                           }}
//                         >
//                           🗑️
//                         </button>
//                       </div>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProjectsPanel;

// import React, { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import Loader from "./Loader";
// import ErrorMessage from "./ErrorMessage";
// import { BASE_API } from "../utils/baseApi";

// const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchParams] = useSearchParams();
//   const [showProjects, setShowProjects] = useState(false);
//   const [deleteProject, setDeleteProject] = useState(null);
//   const [confirmationText, setConfirmationText] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchProjects() {
//       try {
//         const res = await fetch(`${BASE_API}/projects/get/all`);
//         if (!res.ok) {
//           throw new Error(`${res.status}: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProjects();
//   }, []);

//   const handleEdit = (project) => {
//     setAddProject({
//       isEditing: true,
//       projectData: {
//         name: project.projectname,
//         url: project.projecturl,
//         preprodUrl: project.preprodUrl || "",
//         prodUrl: project.prodUrl || "",
//         pgUrl: project.pgUrl || "",
//         uuid: project.uuid,
//       },
//     });
//   };

//   const handleDeleteClick = (project) => {
//     setDeleteProject(project);
//     setConfirmationText("");
//   };

//   const confirmDelete = async () => {
//     if (confirmationText !== deleteProject.projectname) {
//       alert("Project name does not match. Please try again.");
//       return;
//     }

//     try {
//       setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== deleteProject.uuid));
//       console.log(`Project "${deleteProject.projectname}" deleted successfully.`);
//       setDeleteProject(null);
//     } catch (error) {
//       console.error("Error deleting project:", error);
//     }
//   };

//   const filteredProjects = search
//     ? projects.filter((project) =>
//         project.projectname.toLowerCase().includes(search.toLowerCase())
//       )
//     : projects;

//   return (
//     <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl rounded-lg">
//       <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
//             <input
//               type="text"
//               placeholder="Search projects..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={() => setAddProject({ isEditing: false })}
//               className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
//             >
//               +
//             </button>
//           </div>

//           {/* Team Section */}
//           <div className="mb-4">
//             <div
//               className="p-3 bg-gray-200 rounded-lg cursor-pointer font-bold"
//               onClick={() => setShowProjects(!showProjects)}
//             >
//               TNS Team {showProjects ? "▼" : "▶"}
//             </div>
//             {showProjects && (
//               <ul className="mt-2">
//                 {error ? (
//                   <ErrorMessage error={error} />
//                 ) : (
//                   filteredProjects.map((project, index) => (
//                     <li
//                       key={index}
//                       className={`p-3 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02] ${
//                         search && search.toLowerCase() === project.projectname.toLowerCase() ? "bg-blue-200" : ""
//                       }`}
//                       onClick={() => navigate(`?id=${project.uuid}`)}
//                     >
//                       <span className="font-medium">{project.projectname}</span>
//                       <div className="flex gap-2">
//                         <button
//                           className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleEdit(project);
//                           }}
//                         >
//                           ✏️
//                         </button>
//                         <button
//                           className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteClick(project);
//                           }}
//                         >
//                           🗑️
//                         </button>
//                       </div>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             )}
//           </div>
//         </>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteProject && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h3 className="text-lg font-bold text-red-600 mb-3">Delete Project</h3>
//             <p className="text-gray-700 mb-4">
//               <strong>Warning:</strong> This action is irreversible. To confirm, type
//               <span className="text-red-500 font-bold"> "{deleteProject.projectname}"</span> below:
//             </p>
//             <input
//               type="text"
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               value={confirmationText}
//               onChange={(e) => setConfirmationText(e.target.value)}
//             />
//             <div className="flex justify-end gap-3 mt-4">
//               <button
//                 className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-all"
//                 onClick={() => setDeleteProject(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className={`p-2 text-white rounded-md transition-all ${
//                   confirmationText === deleteProject.projectname
//                     ? "bg-red-600 hover:bg-red-700"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//                 onClick={confirmDelete}
//                 disabled={confirmationText !== deleteProject.projectname}
//               >
//                 Delete Project
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectsPanel;


// import React, { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import Loader from "./Loader";
// import ErrorMessage from "./ErrorMessage";
// import { BASE_API } from "../utils/baseApi";

// const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchParams] = useSearchParams();
//   const [showProjects, setShowProjects] = useState(true); // Open by default
//   const [deletePrompt, setDeletePrompt] = useState(null);
//   const [confirmText, setConfirmText] = useState("");
//   const currentId = searchParams.get("id");
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchProjects() {
//       try {
//         const res = await fetch(`${BASE_API}/projects/get/all`);
//         if (!res.ok) {
//           throw new Error(`${res.status}: ${res.statusText}`);
//         }
//         const data = await res.json();
//         setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProjects();
//   }, []);

//   const handleEdit = (project) => {
//     setAddProject({
//       isEditing: true,
//       projectData: {
//         name: project.projectname,
//         url: project.projecturl,
//         preprodUrl: project.preprodUrl || "",
//         prodUrl: project.prodUrl || "",
//         pgUrl: project.pgUrl || "",
//         uuid: project.uuid,
//       },
//     });
//   };

//   const handleDelete = async () => {
//     if (!deletePrompt) return;
//     if (confirmText !== deletePrompt.projectname) return alert("Project name does not match!");
    
//     try {
//       setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== deletePrompt.uuid));
//       setDeletePrompt(null);
//       setConfirmText("");
//       console.log("Project deleted successfully from state.");
//     } catch (error) {
//       console.error("Error deleting project:", error);
//     }
//   };

//   const filteredProjects = search
//     ? projects.filter((project) =>
//         project.projectname.toLowerCase().includes(search.toLowerCase())
//       )
//     : projects;

//   return (
//     <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl rounded-lg">
//       <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
//             <input
//               type="text"
//               placeholder="Search projects..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={() => setAddProject({ isEditing: false })}
//               className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
//             >
//               +
//             </button>
//           </div>

//           {/* Team Section */}
//           <div className="mb-4">
//             <div
//               className="p-3 bg-gray-200 rounded-lg cursor-pointer font-bold"
//               onClick={() => setShowProjects(!showProjects)}
//             >
//               TNS Team {showProjects ? "▼" : "▶"}
//             </div>
//             {showProjects && (
//               <ul className="mt-2">
//                 {error ? (
//                   <ErrorMessage error={error} />
//                 ) : (
//                   filteredProjects.map((project) => (
//                     <li
//                       key={project.uuid}
//                       className="p-3 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02]"
//                       onClick={() => navigate(`?id=${project.uuid}`)}
//                     >
//                       <span className="font-medium">{project.projectname}</span>
//                       <div className="flex gap-2">
//                         <button
//                           className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleEdit(project);
//                           }}
//                         >
//                           ✏️
//                         </button>
//                         <button
//                           className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setDeletePrompt(project);
//                           }}
//                         >
//                           🗑️
//                         </button>
//                       </div>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProjectsPanel;




// 



import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";

const ProjectsPanel = ({ projects, setProjects, setAddProject }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [showProjects, setShowProjects] = useState(true); // Open by default
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const currentId = searchParams.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${BASE_API}/projects/get/all`);
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setProjects(data.sort((a, b) => a.projectname.localeCompare(b.projectname)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleEdit = (project) => {
    setAddProject({
      isEditing: true,
      projectData: {
        name: project.projectname,
        url: project.projecturl,
        preprodUrl: project.preprodUrl || "",
        prodUrl: project.prodUrl || "",
        pgUrl: project.pgUrl || "",
        uuid: project.uuid,
      },
    });
  };

  const handleDelete = async () => {
    if (!deletePrompt) return;
    if (confirmText !== deletePrompt.projectname) return alert("Project name does not match!");
    
    try {
      setProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== deletePrompt.uuid));
      setDeletePrompt(null);
      setConfirmText("");
      console.log("Project deleted successfully from state.");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const filteredProjects = search
    ? projects.filter((project) =>
        project.projectname.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="relative w-[25%] bg-gray-50 p-4 shadow-xl rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-center">Projects</h2>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full mb-4 flex justify-center items-center h-[40px] gap-2 relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[80%] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setAddProject({ isEditing: false })}
              className="p-2 w-[20%] h-[40px] bg-blue-600 text-white rounded-md flex justify-center items-center hover:bg-blue-700 transition-colors"
            >
              +
            </button>
          </div>

          {/* Team Section */}
          <div className="mb-4">
            <div
              className="p-3 bg-gray-200 rounded-lg cursor-pointer font-bold flex justify-between items-center"
              onClick={() => setShowProjects(!showProjects)}
            >
              <span>TNS Team</span>
              <span className="ml-auto">{showProjects ? "▼" : "▶"}</span>
            </div>
            {showProjects && (
              <ul className="mt-2">
                {error ? (
                  <ErrorMessage error={error} />
                ) : (
                  filteredProjects.map((project) => (
                    <li
                      key={project.uuid}
                      className="p-3 flex justify-between items-center border border-gray-300 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02]"
                      onClick={() => navigate(`?id=${project.uuid}`)}
                    >
                      <span className="font-medium">{project.projectname}</span>
                      <div className="flex gap-2">
                        <button
                          className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletePrompt(project);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deletePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[400px] text-center">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p>Type <b>{deletePrompt.projectname}</b> to confirm deletion:</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setDeletePrompt(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPanel;
