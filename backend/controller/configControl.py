from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.database import get_db, ProjectInfo
import requests
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

class ProjectCreate(BaseModel):
    projectname: str
    projecturl: str

@router.post("/projects/add")
async def add_project(project: ProjectCreate):
    # Validate projecturl with exception handling and JSON validation
    try:
        # response = requests.get(project.projecturl)
        response = requests.get(project.projecturl, verify=False)  # Disable SSL verification
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Invalid URL: {exc}")
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        response.json()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        db = next(get_db())
        new_project = ProjectInfo(projectname=project.projectname, projecturl=project.projecturl)
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Somethig went to wrong...")
    return {
        "uuid": new_project.uuid,
        "projectname": new_project.projectname,
        "projecturl": new_project.projecturl
    }

@router.get("/projects/get/all")
async def get_all_projects():
    try:
        db = next(get_db())
        projects = db.query(ProjectInfo).all()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Somethig went to wrong...")
    return [{"projectname": p.projectname, "uuid": p.uuid,"url":p.projecturl} for p in projects]

@router.put("/projects/update/{uuid}")
async def update_project(uuid: str, project: ProjectCreate):
    # Validate projecturl with exception handling and JSON validation
    try:
        response = requests.get(project.projecturl)
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Invalid URL: {exc}")
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        response.json()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        db = next(get_db())
        existing_project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not existing_project:
            return {"error": "Project not found"}
        existing_project.projectname = project.projectname
        existing_project.projecturl = project.projecturl
        db.commit()
        db.refresh(existing_project)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Somethig went to wrong...")
    return {
        "uuid": existing_project.uuid,
        "projectname": existing_project.projectname,
        "projecturl": existing_project.projecturl
    }