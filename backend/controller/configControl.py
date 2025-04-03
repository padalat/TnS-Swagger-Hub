from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, validator
from database.database import get_db, ProjectInfo
import requests
from sqlalchemy.exc import SQLAlchemyError
import urllib3
import json
from fastapi.responses import JSONResponse
import traceback
import logging

# Disable SSL warnings for development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ProjectCreate(BaseModel):
    projectname: str
    team_name: str
    prod_url: str
    pre_prod_url: str = None
    pg_url: str = None
    
    # Add validators to ensure proper URL formats
    @validator('prod_url', 'pre_prod_url', 'pg_url')
    def validate_url(cls, v, values, **kwargs):
        if v is None:
            return v
        # Simple validation to check for URL format
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must begin with http:// or https://')
        return v

@router.post("/projects/add", status_code=status.HTTP_201_CREATED)
async def add_project(project: ProjectCreate):
    """Add a new project with minimal validation to handle more URL types"""
    
    # Validate production URL
    if project.prod_url:
        try:
            # Custom headers to help with some APIs
            headers = {
                "Accept": "application/json, */*",
                "User-Agent": "Mozilla/5.0 TnS-Swagger-Hub/1.0"
            }
            
            # More lenient timeout and disable verification for internal/IP URLs
            response = requests.get(
                project.prod_url,
                headers=headers,
                verify=False,
                timeout=15
            )
            
            # Log details for debugging
            logger.info(f"URL: {project.prod_url}, Status: {response.status_code}")
            logger.info(f"Content-Type: {response.headers.get('Content-Type')}")
            
            # Allow any 2xx status code
            if response.status_code < 200 or response.status_code >= 300:
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Production URL returned status {response.status_code}"}
                )
            
            # Extremely relaxed validation - just check it's parseable as JSON
            try:
                content = response.content.decode('utf-8')
                logger.info(f"Response content first 100 chars: {content[:100]}...")
                json_data = json.loads(content)
                
                # Very minimal check for something JSON-like
                if not isinstance(json_data, dict):
                    logger.warning(f"JSON doesn't appear to be an object: {type(json_data)}")
                    return JSONResponse(
                        status_code=422,
                        content={"detail": "URL returned JSON, but not a valid API spec format"}
                    )
                    
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                logger.error(f"JSON parse error: {str(e)}")
                logger.error(f"Response content: {response.content[:200]}")
                return JSONResponse(
                    status_code=422,
                    content={"detail": f"URL did not return valid JSON: {str(e)}"}
                )
                
        except requests.exceptions.RequestException as exc:
            logger.error(f"Request error: {str(exc)}")
            return JSONResponse(
                status_code=400,
                content={"detail": f"Error connecting to URL: {str(exc)}"}
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={"detail": f"Unexpected error processing URL: {str(e)}"}
            )
    
    # Skip detailed validation for pre-production and playground URLs
    # Just check they're reachable if provided
    for url_type, url in [
        ("Pre-production", project.pre_prod_url),
        ("Playground", project.pg_url)
    ]:
        if url:
            try:
                response = requests.head(
                    url, 
                    verify=False, 
                    timeout=5, 
                    headers={"User-Agent": "TnS-Swagger-Hub/1.0"}
                )
                # Just log issues but don't block creation
                if response.status_code >= 400:
                    logger.warning(f"{url_type} URL returned {response.status_code}")
            except Exception as e:
                logger.warning(f"Error checking {url_type} URL: {str(e)}")
                # Continue anyway - don't block creation for secondary URLs
    
    # Database operations - make this safer with better error handling
    try:
        db = next(get_db())
        new_project = ProjectInfo(
            projectname=project.projectname,
            team_name=project.team_name,
            prod_url=project.prod_url,
            pre_prod_url=project.pre_prod_url,
            pg_url=project.pg_url
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        
        # Return the newly created project
        return {
            "uuid": new_project.uuid,
            "projectname": new_project.projectname,
            "team_name": new_project.team_name,
            "prod_url": new_project.prod_url,
            "pre_prod_url": new_project.pre_prod_url,
            "pg_url": new_project.pg_url
        }
    except SQLAlchemyError as e:
        db.rollback()  # Roll back the transaction on error
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"}
        )

@router.get("/projects/get/all")
async def get_all_projects(team_name: str):  # added team_name parameter as query param
    try:
        db = next(get_db())
        projects = db.query(ProjectInfo).filter(ProjectInfo.team_name == team_name).all()  # filter by team_name
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return [
        {
            "uuid": p.uuid,
            "projectname": p.projectname,
            "team_name": p.team_name, 
            "prod_url": p.prod_url,
            "pre_prod_url": p.pre_prod_url,
            "pg_url": p.pg_url
        } for p in projects
    ]

@router.get("/projects/{uuid}")
async def get_project(uuid: str):
    try:
        db = next(get_db())
        project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error occurred")
    
    return {
        "uuid": project.uuid,
        "projectname": project.projectname,
        "team_name": project.team_name,
        "prod_url": project.prod_url,
        "pre_prod_url": project.pre_prod_url,
        "pg_url": project.pg_url
    }

@router.put("/projects/update/{uuid}")
async def update_project(uuid: str, project: ProjectCreate):
    if project.prod_url:
        try:
            response = requests.get(project.prod_url, verify=False) 
            if response.status_code != 200:
                    raise HTTPException(status_code=400, detail="Invalid prod url")
            response.json()
        except Exception as exc:
                raise HTTPException(status_code=400, detail=f"Invalid prod url: {exc}")
    if project.pre_prod_url:
        try:
            r_pre = requests.get(project.pre_prod_url, verify=False)
            if r_pre.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid pre_prod_url")
            r_pre.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pre_prod_url: {exc}")
    if project.pg_url:
        try:
            r_pg = requests.get(project.pg_url, verify=False)
            if r_pg.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid pg_url")
            r_pg.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pg_url: {exc}")
    try:
        db = next(get_db())
        existing_project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not existing_project:
            return {"error": "Project not found"}
        existing_project.projectname = project.projectname
        existing_project.prod_url = project.prod_url
        existing_project.pre_prod_url = project.pre_prod_url
        existing_project.pg_url = project.pg_url
        db.commit()
        db.refresh(existing_project)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {
        "uuid": existing_project.uuid,
        "projectname": existing_project.projectname,
        "team_name": existing_project.team_name, 
        "prod_url": existing_project.prod_url,
        "pre_prod_url": existing_project.pre_prod_url,
        "pg_url": existing_project.pg_url
    }

@router.delete("/projects/delete/{uuid}")
async def delete_project(uuid: str):
    try:
        db = next(get_db())
        project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        db.delete(project)
        db.commit()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {"message": "Project deleted successfully"}
