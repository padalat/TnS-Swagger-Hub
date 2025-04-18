import { BASE_API } from "./baseApi";

const requestInterceptor = (req) => {
    req.headers.swagger_url=req.url
    req.url = `${BASE_API}/swagger-fetch`;
    
    return req;
};

export default requestInterceptor;