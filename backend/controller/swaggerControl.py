from fastapi import APIRouter, HTTPException, Request
import httpx
import asyncio
import re
from json.decoder import JSONDecodeError
from database.database import get_db, ProjectInfo
import json
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/swagger/")
async def get_all_swagger():
    """Fetch OpenAPI JSON for all services using project URLs from DB"""
    db = next(get_db())
    projects = db.query(ProjectInfo).all()
    async with httpx.AsyncClient() as client:
        tasks = [fetch_service_json(client, project.projectname, project.projecturl, project.uuid) for project in projects]
        responses = await asyncio.gather(*tasks)
    return responses

async def fetch_service_json(client, service_name, url, id):
    """Fetch OpenAPI JSON from a given service URL"""
    try:
        response = await client.get(url)
        if response.status_code == 200:
            try:
                data = response.json()
            except JSONDecodeError:
                return {"service": service_name, "swagger": None}
            return {"service": service_name, "swagger": data, "id": id}
    except httpx.HTTPError:
        pass
    return {"service": service_name, "swagger": None}

@router.get("/swagger/{uuid}/")
async def get_swagger_by_uuid(uuid: str):
    db = next(get_db())
    project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    async with httpx.AsyncClient() as client:
        swagger_data = await fetch_service_json(client, project.projectname, project.projecturl, project.uuid)
    return swagger_data

@router.get("/fetch-event-configs/")
async def fetch_event_configs(request: Request):
    """Fetch event configurations from a given swagger URL"""
    incoming_headers = dict(request.headers)
    match = re.search(r'http://([\d\.]+)', incoming_headers["swagger_url"])
    incoming_headers["host"] = str(match.group(1))
    incoming_headers["referer"] = f"http://{str(match.group(1))}/swagger-ui/index.html"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(incoming_headers["swagger_url"], headers=incoming_headers)
        
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}
    except httpx.HTTPStatusError as e:
        # Return the error response as JSON directly
        try:
            error_content = json.loads(e.response.text)
        except json.JSONDecodeError:
            error_content = {"error": e.response.text}
        return JSONResponse(status_code=e.response.status_code, content=error_content)
    
    except httpx.RequestError as e:
        try:
            error_content = json.loads(str(e))
        except json.JSONDecodeError:
            error_content = {"error": str(e)}
        return JSONResponse(status_code=500, content=error_content)

@router.post("/fetch-event-configs/")
async def post_event_configs(request: Request):
    """Post event configurations to a given swagger URL"""
    incoming_headers = dict(request.headers)
    swagger_url = incoming_headers.get("swagger_url")
    if not swagger_url:
        raise HTTPException(status_code=400, detail="Missing 'swagger_url' in headers")
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
        
        # This will raise an exception if the response is not 2xx.
        response.raise_for_status()
        
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}
    
    except httpx.HTTPStatusError as e:
        # Return the error response as JSON directly
        try:
            error_content = json.loads(e.response.text)
        except json.JSONDecodeError:
            error_content = {"error": e.response.text}
        return JSONResponse(status_code=e.response.status_code, content=error_content)
    
    except httpx.RequestError as e:
        try:
            error_content = json.loads(str(e))
        except json.JSONDecodeError:
            error_content = {"error": str(e)}
        return JSONResponse(status_code=500, content=error_content)

@router.get("/getprojects/")
async def get_all_projects():
    db = next(get_db())
    projects = db.query(ProjectInfo).all()
    return [{"projectname": p.projectname, "uuid": p.uuid} for p in projects]