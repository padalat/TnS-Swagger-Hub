from fastapi import APIRouter
from pydantic import BaseModel
from database.database import get_db, ProjectInfo

router = APIRouter()

class ProjectCreate(BaseModel):
    projectname: str
    projecturl: str

@router.post("/projects/")
async def add_project(project: ProjectCreate):
    db = next(get_db())
    new_project = ProjectInfo(projectname=project.projectname, projecturl=project.projecturl)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {
        "uuid": new_project.uuid,
        "projectname": new_project.projectname,
        "projecturl": new_project.projecturl
    }