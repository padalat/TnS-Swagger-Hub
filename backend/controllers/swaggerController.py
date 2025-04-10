import httpx
import asyncio
import re
import json
from json.decoder import JSONDecodeError
from database.database import get_db, FDProjectRegistry
from fastapi.responses import JSONResponse

async def get_all_swagger_docs():
    db = next(get_db())
    projects = db.query(FDProjectRegistry).all()
    async with httpx.AsyncClient() as client:
        tasks = [fetch_swagger_from_url(client, project.project_name, project.production_url, project.project_uuid) 
                for project in projects if project.production_url]
        responses = await asyncio.gather(*tasks)
    return responses

async def fetch_swagger_from_url(client, projectname, url, id):
    try:
        response = await client.get(url)
        if response.status_code == 200:
            try:
                data = response.json()
            except JSONDecodeError:
                return {"service": projectname, "swagger": None}
            return {"service": projectname, "swagger": data, "id": id}
    except httpx.HTTPError:
        pass
    return {"service": projectname, "swagger": None}

async def get_project_swagger_by_uuid_and_env(uuid: str, env: str):
    db = next(get_db())
    project = db.query(FDProjectRegistry).filter(FDProjectRegistry.project_uuid == uuid).first()
    if not project:
        raise Exception("Project not found")
    
    # Map environment keys to the new database column names
    env_mapping = {
        "prod_url": "production_url",
        "pre_prod_url": "pre_production_url",
        "pg_url": "playground_url"
    }
    
    if env not in env_mapping:
        raise Exception("Invalid environment specified")
        
    db_column = env_mapping[env]
    requested_url = getattr(project, db_column)
    
    if not requested_url:
        raise Exception(f"The '{env}' is null for this project")
    
    async with httpx.AsyncClient() as client:
        swagger_data = await fetch_swagger_from_url(client, project.project_name, requested_url, project.project_uuid)
    return swagger_data

async def fetch_event_configs(request):
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

async def post_event_configs(request):
    incoming_headers = dict(request.headers)
    swagger_url = incoming_headers.get("swagger_url")
    if not swagger_url:
        raise Exception("Missing 'swagger_url' in headers")
    match = re.search(r'https?://([\d\.]+)', swagger_url)
    if not match:
        raise Exception("Invalid 'swagger_url' format")
    host = match.group(1)
    headers = incoming_headers.copy()
    headers["host"] = host
    headers["referer"] = f"http://{host}/swagger-ui/index.html"
    
    payload = await request.body()
    if payload:
        headers["content-length"] = str(len(payload))
    else:
        payload = None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(swagger_url, headers=headers, content=payload)
        response.raise_for_status()
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}
    except httpx.HTTPStatusError as e:
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

async def put_event_configs(request):
    incoming_headers = dict(request.headers)
    swagger_url = incoming_headers.get("swagger_url")
    if not swagger_url:
        raise Exception("Missing 'swagger_url' in headers")
    match = re.search(r'https?://([\d\.]+)', swagger_url)
    if not match:
        raise Exception("Invalid 'swagger_url' format")
    host = match.group(1)
    headers = incoming_headers.copy()
    headers["host"] = host
    headers["referer"] = f"http://{host}/swagger-ui/index.html"

    payload = await request.body()
    if payload:
        headers["content-length"] = str(len(payload))
    else:
        payload = None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(swagger_url, headers=headers, content=payload)
        response.raise_for_status()
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}
    except httpx.HTTPStatusError as e:
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

async def patch_event_configs(request):
    incoming_headers = dict(request.headers)
    swagger_url = incoming_headers.get("swagger_url")
    if not swagger_url:
        raise Exception("Missing 'swagger_url' in headers")
    match = re.search(r'https?://([\d\.]+)', swagger_url)
    if not match:
        raise Exception("Invalid 'swagger_url' format")
    host = match.group(1)
    headers = incoming_headers.copy()
    headers["host"] = host
    headers["referer"] = f"http://{host}/swagger-ui/index.html"

    payload = await request.body()
    if payload:
        headers["content-length"] = str(len(payload))
    else:
        payload = None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(swagger_url, headers=headers, content=payload)
        response.raise_for_status()
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}
    except httpx.HTTPStatusError as e:
        try:
            error_content = json.loads(e.response.text)
        except JSONDecodeError:
            error_content = {"error": e.response.text}
        return JSONResponse(status_code=e.response.status_code, content=error_content)
    except httpx.RequestError as e:
        try:
            error_content = json.loads(str(e))
        except JSONDecodeError:
            error_content = {"error": str(e)}
        return JSONResponse(status_code=500, content=error_content)

async def delete_event_configs(request):
    incoming_headers = dict(request.headers)
    swagger_url = incoming_headers.get("swagger_url")

    if not swagger_url:
        return JSONResponse(status_code=400, content={"error": "Missing 'swagger_url' in headers"})

    match = re.search(r'https?://([\d\.]+)', swagger_url)
    if not match:
        return JSONResponse(status_code=400, content={"error": "Invalid 'swagger_url' format"})

    host = match.group(1)
    headers = {key: value for key, value in incoming_headers.items() if key.lower() not in ["host", "content-length"]}
    headers["host"] = host
    headers["referer"] = f"http://{host}/swagger-ui/index.html"

    # Read request body
    payload_bytes = await request.body()

    if payload_bytes:
        try:
            payload = json.loads(payload_bytes.decode("utf-8"))  # Convert bytes -> dict
        except json.JSONDecodeError:
            return JSONResponse(status_code=400, content={"error": "Invalid JSON payload"})
    else:
        payload = None  # No payload

    try:
        async with httpx.AsyncClient() as client:
            if payload:
                response = await client.request(
                    method="DELETE",
                    url=swagger_url,
                    json=payload,
                    headers=headers
                )
            else:
                response = await client.delete(swagger_url, headers=headers)

        response.raise_for_status()

        # Handle response content
        if response.text.strip():
            try:
                return response.json()
            except ValueError:
                return {"message": "Success", "data": response.text}
        else:
            return {"message": "Success", "data": None}

    except httpx.HTTPStatusError as e:
        return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})

    except httpx.RequestError as e:
        return JSONResponse(status_code=500, content={"error": str(e)})