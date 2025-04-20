import requests
from database.database import get_db, FDProjectRegistry, FDActivityLog, FDTeam, IST
from sqlalchemy.exc import SQLAlchemyError
import requests.exceptions
from fastapi import HTTPException, File, UploadFile
from datetime import datetime
import uuid
import pandas as pd
from io import BytesIO, StringIO
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pydantic import ValidationError


INVALID_VALUES = {"", "None", "null", "NULL", "none", "N/A", "n/a", "NaN", None, float('nan')}


class ProjectCreate(BaseModel):
    projectname: str
    prod_url: str = None
    pre_prod_url: str = None
    pg_url: str = None
    team_name:str=None

def ensure_scheme(url):
    if not (url.startswith("http://") or url.startswith("https://")):
        return "http://" + url
    return url


async def create_new_project(body, user: dict, db: Session) -> dict:
    if not (getattr(body, 'prod_url', None) or getattr(body, 'pre_prod_url', None) or getattr(body, 'pg_url', None)):
        raise HTTPException(status_code=400, detail="At least one URL must be provided")

    for key, label in [('prod_url','prod_url'), ('pre_prod_url','pre_prod_url'), ('pg_url','pg_url')]:
        url = getattr(body, key, None)
        url = str(url).strip() if url is not None else ""
        print(url)
        if pd.isna(url) or str(url).strip() in INVALID_VALUES:
            setattr(body, key, None)
            print(f"{label} is considered empty")
        elif url:
            try:
                safe_url = ensure_scheme(url)
                resp = requests.get(safe_url, verify=False)
                resp.raise_for_status()
                resp.json()
            except requests.exceptions.RequestException:
                raise HTTPException(status_code=400, detail=f"Invalid {label}")
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid JSON response from {label}")

    if user.get('flipdocs-admin'):
        team_name =  body.team_name
    else:
        team_name = user.get('team_name')

    team = db.query(FDTeam).filter(FDTeam.team_name == team_name).first()
    if not team:
        raise HTTPException(status_code=400, detail=f"Invalid team name {team_name}")

    enforce_log_limit(db, team.team_id)

    project = FDProjectRegistry(
        project_uuid=str(uuid.uuid4()),
        project_name=body.projectname,
        team_id=team.team_id,
        production_url=body.prod_url,
        pre_production_url=body.pre_prod_url,
        playground_url=body.pg_url
    )
    db.add(project)
    db.flush()

    activity = FDActivityLog(
        log_uuid=str(uuid.uuid4()),
        log_message=f"Project '{body.projectname}' added",
        log_timestamp=datetime.now(IST),
        team_id=team.team_id
    )
    db.add(activity)

    return {
        "uuid": project.project_uuid,
        "projectname": project.project_name,
        "team_name": team.team_name,
        "prod_url": project.production_url,
        "pre_prod_url": project.pre_production_url,
        "pg_url": project.playground_url
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
        enforce_log_limit(db, team.team_id)
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
        enforce_log_limit(db, team.team_id)
        
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
            "message": activity.log_message,
            "time":activity.log_timestamp
        } for activity in activities
    ]


async def fetch_project_statistics(user):
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
    try:
        db = next(get_db())
        existing_team = db.query(FDTeam).filter(FDTeam.team_name == team.team_name).first()
        if existing_team:
            raise HTTPException(status_code=400, detail=f"Team with name '{team.team_name}' already exists")
        
        new_team = FDTeam(
            team_id=str(uuid.uuid4()),
            team_name=team.team_name,
            created_at=datetime.now(IST)
        )
        db.add(new_team)
        activity = FDActivityLog(
            log_uuid=str(uuid.uuid4()),
            log_message=f"Team '{team.team_name}' created",
            log_timestamp=datetime.now(IST),
            team_id=new_team.team_id
        )
        db.add(activity)
        db.commit()
        
        return {
            "team_id": new_team.team_id,
            "team_name": new_team.team_name
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong when creating the team")


async def get_all_teams(user):
    try:
        db = next(get_db())
        
        if user.get("flipdocs-admin"):
            teams = db.query(FDTeam).all()
            return {"teams": [{"team_id":team.team_id,"team_name":team.team_name} for team in teams]}
        
        team_name = user.get("team_name")
        if not team_name:
            raise HTTPException(status_code=400, detail="Team name not found in user token")
        
        team = db.query(FDTeam).filter(FDTeam.team_name == team_name).first()
        if not team:
            raise HTTPException(status_code=404, detail=f"Team '{team_name}' not found")
        
        return {"teams": [{"team_id":team.team_id,"team_name":team.team_name}]}
        
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong retrieving team data")
    

def sanitize_url(url):
    if pd.isna(url) or str(url).strip() in ["", "None", "null", "NULL", "none", "N/A", "n/a", "NaN"]:
        return None
    return url

async def upload_projects(file: UploadFile, user: dict, db: Session):
    filename = file.filename
    content = await file.read()

    # Load file
    try:
        if filename.lower().endswith('.csv'):
            df = pd.read_csv(StringIO(content.decode('utf-8')))
        elif filename.lower().endswith(('.xls', '.xlsx')):
            df = pd.read_excel(BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Upload CSV or Excel.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    required_cols = ["project-name", "production-url", "pre-production-url", "playground-url"]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing columns: {', '.join(missing)}")

    results = []

    try:
        for i, row in df.iterrows():
            project_name = row.get('project-name')
            if not project_name or str(project_name).strip() in INVALID_VALUES:
                raise HTTPException(status_code=422, detail=f"Row {i}: Invalid or missing 'project-name'")

            team_name = row.get('team_name')
            if team_name is None or str(team_name).strip() in INVALID_VALUES:
                team_name = user.get('team_name')

            project_data = {
                "projectname": str(project_name).strip(),
                "team_name": team_name
            }

            for col, key in [
                ('production-url', 'prod_url'),
                ('pre-production-url', 'pre_prod_url'),
                ('playground-url', 'pg_url')
            ]:
                value = sanitize_url(row.get(col))
                if value is not None:
                    project_data[key] = value

            try:
                project = ProjectCreate(**project_data)
            except ValidationError as e:
                error_messages = []
                for err in e.errors():
                    loc = ' → '.join(str(l) for l in err['loc'])
                    msg = err['msg']
                    error_messages.append(f"{loc}: {msg}")
                error_str = "; ".join(error_messages)
                raise HTTPException(
                    status_code=422,
                    detail=f"Row {i}: ProjectCreate → {error_str}"
                )
            print(project_data)
            try:
                res = await create_new_project(project, user, db)
                results.append(res)
            except HTTPException as e:
                error_message = f"Row {i}: {e.detail}"
                raise HTTPException(status_code=e.status_code, detail=error_message)

        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"{e}")

    return {
        "filename": filename,
        "processed": len(results),
        "results": results
    }

MAX_LOGS_PER_TEAM = 30

def enforce_log_limit(db: Session, team_id: str, max_logs: int = MAX_LOGS_PER_TEAM):
    count = db.query(FDActivityLog).filter(FDActivityLog.team_id == team_id).count()
    if count >= max_logs:
        oldest_log = (
            db.query(FDActivityLog)
              .filter(FDActivityLog.team_id == team_id)
              .order_by(FDActivityLog.log_timestamp.asc())
              .first()
        )
        if oldest_log:
            db.delete(oldest_log)
            db.flush()  
