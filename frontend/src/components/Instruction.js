import React from "react";

const Instruction = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Project URL Instructions</h2>
        <p className="text-gray-600">
          ✅ Your project URL should start with <b>http://</b> or <b>https://</b>. <br />
          ✅ Avoid spaces or special characters in URLs. <br />
          ✅ Example: <span className="text-blue-500">https://example.com</span>.
        </p>
      </div>
    </div>
  );
};

export default Instruction;