import React, { useState } from "react";

const Instruction = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Instruction Box */}
      <div className="bg-white w-[70%] p-6 rounded-lg shadow-lg relative h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black hover:text-gray-300 px-2 transition duration-200 text-2xl"
        >
          x
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center">Project URL Instructions</h2>

        {/* Scrollable Instructions */}
        <div className="space-y-6">
          {/* Instruction 1 */}
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-700 pb-5 text-lg mt-2">
              <b>Go to:</b>{" "}
              <span className="text-blue-500">
                http://&lt;elb-ip&gt;/webjars/swagger-ui/index.html
              </span>
            </p>
            <img
              src="/images/inst1.png"
              alt="Network"
              className="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedImage("/images/inst1.png")}
            />
          </div>

          {/* Instruction 2 */}
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-700 text-lg mt-2">
              <b>Check for:</b> API Docs at the top of Swagger page (<span className="text-blue-500">/v3/api/docs</span>).
              Copy and paste it after the IP:
              <br />
              <span className="text-blue-500">http://&lt;elb-ip&gt;/v3/api-docs</span>
            </p>
          </div>

          {/* Instruction 3 */}
          <div className="flex flex-col items-center text-center">
          <img
              src="/images/inst2.png"
              alt="Copy Paste"
              className="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedImage("/images/inst2.png")}
            />
            <img
              src="/images/inst3.png"
              alt="JSON"
              className="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedImage("/images/inst3.png")}
            />
            <p className="text-gray-700 text-lg mt-2">
              <b>Verify:</b> Ensure the page displays all JSON objects correctly. Use that URL to add it to the project URL.
            </p>
          </div>

          {/* Instruction 4 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/inst4.png"
              alt="Verification"
              className="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedImage("/images/inst4.png")}
            />
            <p className="text-gray-700 text-lg mt-2">
              <b>Review:</b> Ensure that the API page is correctly formatted before submission.
            </p>
          </div>
        </div>
      </div>

      {/* Enlarged Image Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative">
            {/* Close Button for Enlarged Image */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-2 text-white text-3xl hover:text-red-500 transition"
            >
              x
            </button>

            {/* Full-Size Image */}
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Instruction;
