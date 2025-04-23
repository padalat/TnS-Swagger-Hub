from fastapi import APIRouter, Query, Depends, File, UploadFile
from controllers.configController import (
    create_new_project,
    retrieve_team_projects,
    update_existing_project,
    delete_existing_project,
    fetch_recent_activity_logs,
    fetch_project_statistics,
    create_new_team,
    get_all_teams,
    upload_projects,
)
from pydantic import BaseModel
from dependencies.permissions import require_read_permission, require_write_permission, require_admin_permission
from database.database import get_db
from sqlalchemy.orm import Session

# Updated model: removed team_name field for non-admin endpoints
class ProjectCreate(BaseModel):
    projectname: str
    prod_url: str = None
    pre_prod_url: str = None
    pg_url: str = None
    team_name:str=None

class TeamCreate(BaseModel):
    team_name: str

router = APIRouter()

@router.post("/teams/add", dependencies=[Depends(require_admin_permission)])
async def route_create_team(team: TeamCreate):
    return await create_new_team(team)

@router.post("/projects/add", dependencies=[Depends(require_write_permission)])
async def route_create_project(body: ProjectCreate, user: dict = Depends(require_write_permission),db: Session = Depends(get_db)):
    result=await create_new_project(body,user,db)
    db.commit()
    return result

@router.get("/projects/team/get/all", dependencies=[Depends(require_read_permission)])
async def route_get_team_projects(team_name: str = None, user: dict = Depends(require_read_permission)):
    return await retrieve_team_projects(team_name,user)


@router.put("/projects/update/{project_uuid}", dependencies=[Depends(require_write_permission)])
async def route_update_project(project_uuid: str, body: ProjectCreate, user: dict = Depends(require_write_permission)):
    return await update_existing_project(project_uuid, body,user)

@router.delete("/projects/delete/{uuid}", dependencies=[Depends(require_write_permission)])
async def route_delete_project(uuid: str, user: dict = Depends(require_write_permission)):
    return await delete_existing_project(uuid,user)


@router.get("/activities/recent", dependencies=[Depends(require_read_permission)])
async def route_get_recent_activities(k: int = Query(10, description="Number of recent activities to retrieve"),
                                      user: dict = Depends(require_read_permission)):
    return await fetch_recent_activity_logs(k,user)

@router.get("/statistics", dependencies=[Depends(require_read_permission)])
async def route_get_statistics(user: dict = Depends(require_read_permission)):
    return await fetch_project_statistics(user)

@router.get("/teams/get/all", dependencies=[Depends(require_read_permission)])
async def route_get_teams(user: dict = Depends(require_read_permission)):
    return await get_all_teams(user)



@router.post("/upload/", dependencies=[Depends(require_write_permission)])
async def route_upload_file(file: UploadFile = File(...),user: dict = Depends(require_read_permission),db: Session = Depends(get_db)):
    return await upload_projects(file,user,db)


