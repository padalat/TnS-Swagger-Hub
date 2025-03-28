import React, { useEffect, useState } from "react";
import Swagger from "../../components/Swagger";
import { Link} from "react-router-dom";
const Home = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]); 
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [data,setData]=useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/swagger/")
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setProjects(res.map((item) => item.service));

          setData(res)
          setSwaggerSpec(res[0].swagger);
          localStorage.setItem("swaggerSpec", res[0].swagger); 
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch APIs:", err));
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex ju">
      <div className="w-[20%] bg-gray-100 p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Projects</h2>
        <div className="w-full  mb-4 flex justify-center items-center h-[40px] flex gap-[5px]">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[90%] p-2 border rounded-md "
          />
          <Link to="add" className="p-2 w-[10%] h-[40px] bg-white rounded-md flex justify-center items-center">+</Link>
        </div>
        <ul>
          {filteredProjects.map((project, index) => (
            <li
              key={index}
              className="p-2 bg-white shadow-sm mb-2 rounded cursor-pointer hover:bg-gray-300"
              onClick={()=>{setSwaggerSpec(data[index].swagger)}}
            >
              {project}
            </li>
          ))}
        </ul>
      </div>


      <div className="w-full  p-4 flex justify-center items-center">
        <Swagger swaggerSpec={swaggerSpec}/>
      </div>
    </div>
  );
};

export default Home;
