import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from '../utils/requestInterceptor'
const SwaggerHub = ({ swaggerSpec }) => {

  return (
    <div className="min-h-screen w-full" style={{ padding: "20px" }}>
      {swaggerSpec ? (
        <SwaggerUI
          spec={swaggerSpec}
          requestInterceptor={requestInterceptor}
        />
      ) : (
        <p>Loading API documentation...</p>
      )}
    </div>
  );
};

export default SwaggerHub;
