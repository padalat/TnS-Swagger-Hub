import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import requestInterceptor from '../utils/requestInterceptor';
import Loader from "./Loader";
import WelcomeMessage from "./WelcomeMessage";
import ErrorMessage from "./ErrorMessage";
import { BASE_API } from "../utils/baseApi";
const SwaggerHub = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("id");
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const env = "prod_url"; // use only "prod_url", "pre_prod_url", "pg_url"
  useEffect(() => {
    if (queryParam) { 
      setLoading(true);
      fetch(`${BASE_API}/swagger/get/${queryParam}/${encodeURIComponent(env)}`)
        .then((res) => res.json())
        .then((res) => {
          setSwaggerSpec(res.swagger);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch projects:", err);
          setError("Something went wrong");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [queryParam]);

  return (
    <div className="h-full w-full" style={{ padding: "20px" }}>
      {error 
          ? <ErrorMessage error={error} />
          : loading 
            ? <Loader /> 
            : swaggerSpec 
              ? <SwaggerUI
                  spec={swaggerSpec}
                  requestInterceptor={requestInterceptor}
                />
              : <WelcomeMessage />}
    </div>
  );
};

export default SwaggerHub;
