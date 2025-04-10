from fastapi import APIRouter, HTTPException, Query
from controllers.configController import (
    add_project,
    get_all_projects,
    update_project,
    delete_project,
    get_recent_activities,
    get_project_statistics
)
from pydantic import BaseModel

# Reuse the same Pydantic model from the controller if needed
class ProjectCreate(BaseModel):
    projectname: str
    team_name: str
    prod_url: str = None
    pre_prod_url: str = None
    pg_url: str = None

router = APIRouter()

@router.post("/projects/add")
async def route_add_project(project: ProjectCreate):
    return await add_project(project)

@router.get("/projects/get/all")
async def route_get_all_projects(team_name: str):
    return await get_all_projects(team_name)

@router.put("/projects/update/{uuid}")
async def route_update_project(uuid: str, project: ProjectCreate):
    return await update_project(uuid, project)

@router.delete("/projects/delete/{uuid}")
async def route_delete_project(uuid: str):
    return await delete_project(uuid)

@router.get("/activities/recent")
async def route_get_recent_activities(k: int = Query(10, description="Number of recent activities to retrieve")):
    """Get the k most recent activities"""
    return await get_recent_activities(k)

@router.get("/statistics")
async def route_get_statistics():
    """Get database statistics including project count"""
    return await get_project_statistics()