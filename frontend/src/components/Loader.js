import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      <p className="mt-4 text-gray-600">Loading documentation...</p>
    </div>
  );
};

export default Loader;
