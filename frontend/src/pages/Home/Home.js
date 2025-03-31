import React  from "react";
import Swagger from "../../components/Swagger";
import ProjectsPanel from "../../components/ProjectsPanel";

const Home = () => {
  
  
  return (
    <div className="flex min-h-[95vh]">
      <ProjectsPanel />
      <div className="w-full p-4 flex justify-center items-center">
        <Swagger />
      </div>
      
    </div>
  );
};

export default Home;
