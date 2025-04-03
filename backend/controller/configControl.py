from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.database import get_db, ProjectInfo
import requests
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

class ProjectCreate(BaseModel):
    projectname: str
    team_name: str
    prod_url: str
    pre_prod_url: str = None
    pg_url: str = None

@router.post("/projects/add")
async def add_project(project: ProjectCreate):
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
                raise HTTPException(status_code=400, detail="Invalid pre prod url")
            r_pre.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pre prod url: {exc}")

    if project.pg_url:
        try:
            r_pg = requests.get(project.pg_url, verify=False)
            if r_pg.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid pg url")
            r_pg.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pg url: {exc}")
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
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {
        "uuid": new_project.uuid,
        "projectname": new_project.projectname,
        "team_name": new_project.team_name,
        "prod_url": new_project.prod_url,
        "pre_prod_url": new_project.pre_prod_url,
        "pg_url": new_project.pg_url
    }

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