import React, { useEffect, useState } from "react";
import Swagger from "../../components/Swagger";
import Loader from "../../components/Loader";
import ProjectsPanel from "../../components/ProjectsPanel";
import WelcomeMessage from "../../components/WelcomeMessage";

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
