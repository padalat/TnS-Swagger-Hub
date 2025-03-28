from fastapi import FastAPI, HTTPException,Request
import httpx
import asyncio  # new import
from fastapi.middleware.cors import CORSMiddleware
from json.decoder import JSONDecodeError  # new import
import json
import re

app = FastAPI()

# Dictionary of services and their OpenAPI JSON URLs
APIS = {
    "Poirot Anomaly Detection": {"url":"http://10.83.39.182/v3/api-docs","id":1},
    "service2": {"url":"http://10.83.43.253/v3/api-docs","id":2}
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/swagger/")
async def get_all_swagger():
    """Fetch OpenAPI JSON for all services"""
    results = []

    async with httpx.AsyncClient() as client:
        tasks = [fetch_service_json(client, name, url["url"],url["id"]) for name, url in APIS.items()]
        responses = await asyncio.gather(*tasks)  # changed code

    return responses  # List of OpenAPI JSONs

async def fetch_service_json(client, service_name, url,id):
    """Fetch OpenAPI JSON from a given service URL"""
    try:
        response = await client.get(url)
        if response.status_code == 200:
            try:
                data = response.json()  # changed code
            except JSONDecodeError:
                return {"service": service_name, "swagger": None}  # changed code: return None on decode error
            return {"service": service_name, "swagger": data,"id":id}  # changed code
    except httpx.HTTPError:
        pass
    return {"service": service_name, "swagger": None}  # Return None if fetch fails






@app.get("/fetch-event-configs/")
async def fetch_event_configs(request: Request):
    incoming_headers = dict(request.headers)
    match = re.search(r'http://([\d\.]+)', incoming_headers["swagger_url"])
    incoming_headers["host"]=str(match.group(1))
    incoming_headers["referer"]=f"http://{str(match.group(1))}/swagger-ui/index.html"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(incoming_headers["swagger_url"], headers=incoming_headers)

        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.json())

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

@app.post("/fetch-event-configs/")
async def post_event_configs(request: Request):
    incoming_headers = dict(request.headers)

    # Ensure swagger_url is present in headers
    swagger_url = incoming_headers.get("swagger_url")
    if not swagger_url:
        raise HTTPException(status_code=400, detail="Missing 'swagger_url' in headers")

    # Extract host from the URL
    match = re.search(r'https?://([\d\.]+)', swagger_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid 'swagger_url' format")

    host = match.group(1)

    headers = incoming_headers.copy()
    headers["host"] = host
    headers["referer"] = f"http://{host}/swagger-ui/index.html"

    try:
        payload = await request.body()
        if not payload:  
            payload = None
        else:
            headers["content-length"] = str(len(payload))  

        async with httpx.AsyncClient() as client:
            response = await client.post(swagger_url, headers=headers, content=payload)

        if response.status_code == 200:
            if response.text.strip():  
                try:
                    return response.json()  
                except ValueError:
                    return {"message": "Success", "data": response.text} 
            else:
                return {"message": "Success", "data": None} 

        raise HTTPException(status_code=response.status_code, detail=response.text)

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
