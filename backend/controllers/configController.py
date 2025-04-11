import requests
from database.database import get_db, FDProjectRegistry, FDActivityLog, FDTeam, IST
from sqlalchemy.exc import SQLAlchemyError
import requests.exceptions
from fastapi import HTTPException
from datetime import datetime
import uuid


def ensure_scheme(url):
    if not (url.startswith("http://") or url.startswith("https://")):
        return "http://" + url
    return url


async def create_new_project(body,user):
    if not body.prod_url and not body.pre_prod_url and not body.pg_url:
        raise HTTPException(status_code=400, detail="At least one URL must be provided")

    if body.prod_url:
        try:
            safe_url = ensure_scheme(body.prod_url)
            response = requests.get(safe_url, verify=False)
            response.raise_for_status()  
            response.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid prod url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from prod url")

    if body.pre_prod_url:
        try:
            safe_url = ensure_scheme(body.pre_prod_url)
            r_pre = requests.get(safe_url, verify=False)
            r_pre.raise_for_status()
            r_pre.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pre prod url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pre prod url")

    if body.pg_url:
        try:
            safe_url = ensure_scheme(body.pg_url)
            r_pg = requests.get(safe_url, verify=False)
            r_pg.raise_for_status()
            r_pg.json()
        except requests.exceptions.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Invalid pg url")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON response from pg url")

    try:
        db = next(get_db())
        team_name=None
        if user.get("flipdocs-admin"):
            team_name=body.team_name
        else:
            print(user.get("team_name"))
            team_name=user.get("team_name")
        team = db.query(FDTeam).filter(FDTeam.team_name == team_name).first()
        if not team:
            raise HTTPException(status_code=400, detail="Invalid team name")
    
        new_project = FDProjectRegistry(
            project_uuid=str(uuid.uuid4()),
            project_name=body.projectname,
            team_id=team.team_id,
            production_url=body.prod_url,
            pre_production_url=body.pre_prod_url,
            playground_url=body.pg_url
        )
        db.add(new_project)
        db.flush()
        
        activity = FDActivityLog(
            log_uuid=str(uuid.uuid4()),
            log_message=f"Project '{body.projectname}' added",
            log_timestamp=datetime.now(IST),
            team_id=team.team_id
        )
        db.add(activity)
        db.commit()
        
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
        
    return {
        "uuid": new_project.project_uuid,
        "projectname": new_project.project_name,
        "team_name": team.team_name,
        "prod_url": new_project.production_url,
        "pre_prod_url": new_project.pre_production_url,
        "pg_url": new_project.playground_url
    }


async def retrieve_team_projects(team_name,user):
    try:
        db = next(get_db())
        if not user.get("flipdocs-admin") or not team_name:
            team_name = user.get("team_name")

        team = db.query(FDTeam).filter(FDTeam.team_name == team_name).first()
        
        if not team:
            raise HTTPException(status_code=400, detail="Invalid team name") 
            
        projects = db.query(FDProjectRegistry).filter(FDProjectRegistry.team_id == team.team_id).all()
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
        
    return [
        {
            "uuid": p.project_uuid,
            "projectname": p.project_name,
            "team_name": team_name,
            "prod_url": p.production_url,
            "pre_prod_url": p.pre_production_url,
            "pg_url": p.playground_url
        } for p in projects
    ]


async def update_existing_project(project_uuid: str, body,user):
    prod_url = body.prod_url if body.prod_url and body.prod_url.strip() else None
    pre_prod_url = body.pre_prod_url if body.pre_prod_url and body.pre_prod_url.strip() else None
    pg_url = body.pg_url if body.pg_url and body.pg_url.strip() else None
    
    if not prod_url and not pre_prod_url and not pg_url:
        raise HTTPException(status_code=400, detail="At least one URL must be provided")
    
    body.prod_url = prod_url
    body.pre_prod_url = pre_prod_url
    body.pg_url = pg_url
    
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

        team_name=body.team_name
        if not user.get("flipdocs-admin"):
            team_name = user.get("team_name")

        team = db.query(FDTeam).filter(FDTeam.team_name == team_name).first()
        if not team:
            raise HTTPException(status_code=400, detail="Invalid team name")
        existing_project = db.query(FDProjectRegistry).filter(FDProjectRegistry.project_uuid == project_uuid,FDProjectRegistry.team_id == team.team_id).first()
        
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        
            
        existing_project.project_name = body.projectname
        existing_project.team_id = team.team_id
        existing_project.production_url = prod_url
        existing_project.pre_production_url = pre_prod_url
        existing_project.playground_url = pg_url
        
        db.flush()
        
        activity = FDActivityLog(
            log_uuid=str(uuid.uuid4()),
            log_message=f"Project '{existing_project.project_name}' updated",
            log_timestamp=datetime.now(IST),
            team_id=team.team_id
        )
        db.add(activity)
        db.commit()
        
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
        
    return {
        "uuid": existing_project.project_uuid,
        "projectname": existing_project.project_name,
        "team_name": team.team_name,
        "prod_url": existing_project.production_url,
        "pre_prod_url": existing_project.pre_production_url,
        "pg_url": existing_project.playground_url
    }


async def delete_existing_project(project_uuid: str,user):
    try:
        db = next(get_db())
        project = db.query(FDProjectRegistry).filter(FDProjectRegistry.project_uuid == project_uuid).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        team = db.query(FDTeam).filter(FDTeam.team_name == user.get("team_name")).first()
        if not team:
            raise HTTPException(status_code=400, detail="Invalid team name")
        
        if not user.get("flipdocs-admin"):
            if project.team_id != team.team_id:
                raise HTTPException(status_code=403, detail="You do not have permission to delete this project")
            
        project_name = project.project_name
        project_uuid = project.project_uuid
        
        db.delete(project)
        
        activity = FDActivityLog(
            log_uuid=str(uuid.uuid4()),
            log_message=f"Project '{project_name}' deleted",
            log_timestamp=datetime.now(IST),
            team_id=team.team_id
        )
        db.add(activity)
        db.commit()
        
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong...")
        
    return {"message": "Project deleted successfully"}


async def fetch_recent_activity_logs(k: int, user):
    db = next(get_db())
    if user.get("flipdocs-admin"):
        activities = db.query(FDActivityLog).order_by(FDActivityLog.log_timestamp.desc()).limit(k).all()
    else:
        try:
            team = db.query(FDTeam).filter(FDTeam.team_name == user.get("team_name")).first()
            if not team:
                raise HTTPException(status_code=400, detail="Invalid team name")
            # Use only FDActivityLog filtering by team_id to get activities for this team only.
            activities = db.query(FDActivityLog)\
                           .filter(FDActivityLog.team_id == team.team_id)\
                           .order_by(FDActivityLog.log_timestamp.desc())\
                           .limit(k).all()
        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(status_code=500, detail="Something went wrong...")
    return [
        {
            "uuid": activity.log_uuid,
            "message": activity.log_message
        } for activity in activities
    ]


async def fetch_project_statistics(user):
    """Get statistics about projects in the database"""
    if user.get("flipdocs-admin"):
        try:
            db = next(get_db())
            project_count = db.query(FDProjectRegistry).count()
        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(status_code=500, detail="Something went wrong...")
            
        return {
            "registered_projects": project_count
        }
    else:
        try:
            db = next(get_db())
            team = db.query(FDTeam).filter(FDTeam.team_name == user.get("team_name")).first()
            if not team:
                raise HTTPException(status_code=400, detail="Invalid team name")
            project_count = db.query(FDProjectRegistry).filter(FDProjectRegistry.team_id == team.team_id).count()
        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(status_code=500, detail="Something went wrong...")
            
        return {
            "registered_projects": project_count
        }


async def create_new_team(team):
    """
    Create a new team in the database
    """
    try:
        db = next(get_db())
        
        # Check if team already exists
        existing_team = db.query(FDTeam).filter(FDTeam.team_name == team.team_name).first()
        if existing_team:
            raise HTTPException(status_code=400, detail=f"Team with name '{team.team_name}' already exists")
        
        # Create new team
        new_team = FDTeam(
            team_id=str(uuid.uuid4()),
            team_name=team.team_name,
            created_at=datetime.now(IST)
        )
        db.add(new_team)
        
        # Log the activity with the new team's team_id
        activity = FDActivityLog(
            log_uuid=str(uuid.uuid4()),
            log_message=f"Team '{team.team_name}' created",
            log_timestamp=datetime.now(IST),
            team_id=new_team.team_id
        )
        db.add(activity)
        db.commit()
        
        # Return the created team
        return {
            "team_id": new_team.team_id,
            "team_name": new_team.team_name
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong when creating the team")