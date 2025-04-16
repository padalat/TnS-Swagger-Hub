import React from "react";

const Loader = () => (
  <div className="flex justify-center items-center" style={{ height: "50px" }}>
    <div className="w-8 h-8 border-2 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

export default Loader;
