import requests
from database.database import get_db, ProjectInfo, ActivityLog, IST
from sqlalchemy.exc import SQLAlchemyError
import requests.exceptions
from fastapi import HTTPException
from datetime import datetime


def ensure_scheme(url):
    # Add http:// if no scheme is provided.
    if not (url.startswith("http://") or url.startswith("https://")):
        return "http://" + url
    return url


async def add_project(project):
    if not project.prod_url and not project.pre_prod_url and not project.pg_url:
        raise HTTPException(status_code=400, detail="At least one URL must be provided")

    if project.prod_url:
        try:
            safe_url = ensure_scheme(project.prod_url)
            response = requests.get(safe_url, verify=False)
            response.raise_for_status()  # raises HTTPError if not 200
            response.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid prod url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from prod url")

    if project.pre_prod_url:
        try:
            safe_url = ensure_scheme(project.pre_prod_url)
            r_pre = requests.get(safe_url, verify=False)
            r_pre.raise_for_status()
            r_pre.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pre prod url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pre prod url")

    if project.pg_url:
        try:
            safe_url = ensure_scheme(project.pg_url)
            r_pg = requests.get(safe_url, verify=False)
            r_pg.raise_for_status()
            r_pg.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pg url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pg url")

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
        
        # Log the activity with IST timestamp
        activity = ActivityLog(
            message=f"Project '{project.projectname}' added",
            project_uuid=new_project.uuid,
            timestamp=datetime.now(IST)
        )
        db.add(activity)
        db.commit()
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {
        "uuid": new_project.uuid,
        "projectname": new_project.projectname,
        "team_name": new_project.team_name,
        "prod_url": new_project.prod_url,
        "pre_prod_url": new_project.pre_prod_url,
        "pg_url": new_project.pg_url
    }


async def get_all_projects(team_name: str):
    try:
        db = next(get_db())
        projects = db.query(ProjectInfo).filter(ProjectInfo.team_name == team_name).all()
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


async def update_project(uuid: str, project):
    # Normalize empty strings to None/null
    prod_url = project.prod_url if project.prod_url and project.prod_url.strip() else None
    pre_prod_url = project.pre_prod_url if project.pre_prod_url and project.pre_prod_url.strip() else None
    pg_url = project.pg_url if project.pg_url and project.pg_url.strip() else None
    
    # Check if at least one URL is provided
    if not prod_url and not pre_prod_url and not pg_url:
        raise HTTPException(status_code=400, detail="At least one URL must be provided")
    
    # Update project object with normalized values    
    project.prod_url = prod_url
    project.pre_prod_url = pre_prod_url
    project.pg_url = pg_url
    
    # Validate URLs if they're provided
    if prod_url:
        try:
            safe_url = ensure_scheme(prod_url)
            response = requests.get(safe_url, verify=False)
            response.raise_for_status()
            response.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid prod url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from prod url")

    if pre_prod_url:
        try:
            safe_url = ensure_scheme(pre_prod_url)
            r_pre = requests.get(safe_url, verify=False)
            r_pre.raise_for_status()
            r_pre.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pre_prod_url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pre_prod_url")

    if pg_url:
        try:
            safe_url = ensure_scheme(pg_url)
            r_pg = requests.get(safe_url, verify=False)
            r_pg.raise_for_status()
            r_pg.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pg_url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pg_url")

    try:
        db = next(get_db())
        existing_project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        existing_project.projectname = project.projectname
        existing_project.prod_url = prod_url
        existing_project.pre_prod_url = pre_prod_url
        existing_project.pg_url = pg_url
        db.commit()
        db.refresh(existing_project)
        
        # Log the activity with IST timestamp
        activity = ActivityLog(
            message=f"Project '{existing_project.projectname}' updated",
            project_uuid=existing_project.uuid,
            timestamp=datetime.now(IST)
        )
        db.add(activity)
        db.commit()
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


async def delete_project(uuid: str):
    try:
        db = next(get_db())
        project = db.query(ProjectInfo).filter(ProjectInfo.uuid == uuid).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        # Store project name before deletion for activity log
        project_name = project.projectname
        project_uuid = project.uuid
        
        db.delete(project)
        db.commit()
        
        # Log the activity with IST timestamp
        activity = ActivityLog(
            message=f"Project '{project_name}' deleted",
            project_uuid=project_uuid,
            timestamp=datetime.now(IST)
        )
        db.add(activity)
        db.commit()
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {"message": "Project deleted successfully"}


async def get_recent_activities(k: int):
    """Get k most recent activities"""
    try:
        db = next(get_db())
        activities = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(k).all()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    
    return [
        {
            "uuid": activity.uuid,
            "message": activity.message,
            "timestamp": activity.timestamp,
            "project_uuid": activity.project_uuid
        } for activity in activities
    ]


async def get_project_statistics():
    """Get statistics about projects in the database"""
    try:
        db = next(get_db())
        project_count = db.query(ProjectInfo).count()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Something went wrong...")
    return {
        "registered_projects": project_count
    }