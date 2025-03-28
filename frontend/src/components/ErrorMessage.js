import React from "react";

const ErrorMessage = ({ error }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <h1 className="text-[48px] font-bold">Error</h1>
      <span>{error}</span>
    </div>
  );
};

export default ErrorMessage;
