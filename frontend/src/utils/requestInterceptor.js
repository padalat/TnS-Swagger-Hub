const requestInterceptor = (req) => {
    req.headers.swagger_url=req.url
    req.url = "http://localhost:8000/fetch-event-configs/";
    console.log(req)
    
    return req;
};

export default requestInterceptor;