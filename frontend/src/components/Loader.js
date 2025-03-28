import React from "react";

const Loader = () => (
  <div className="flex justify-center items-center" style={{ height: "100%" }}>
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

export default Loader;
