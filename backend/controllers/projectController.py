import uuid
from sqlalchemy.exc import SQLAlchemyError
from database.database import get_db, FDProjectRegistry, FDActivityLog, FDTeam  # Updated import

def ensure_scheme(url):
    if url and not (url.startswith("http://") or url.startswith("https://")):
        return "http://" + url
    return url

def addProject(project_data):
    print("addProject() called with:", project_data)  # Logging call
    db = next(get_db())
    try:
        # Basic check: at least one URL must be provided
        if not (project_data.get("prod_url") or project_data.get("pre_prod_url") or project_data.get("pg_url")):
            print(f"Skipping insertion for '{project_data.get('projectname')}' as no URL provided")
            return None

        # Ensure URLs have proper scheme
        project_data["prod_url"] = ensure_scheme(project_data.get("prod_url", ""))
        project_data["pre_prod_url"] = ensure_scheme(project_data.get("pre_prod_url", ""))
        project_data["pg_url"] = ensure_scheme(project_data.get("pg_url", ""))

        # Look up team by team name from CSV row data.
        team = db.query(FDTeam).filter(FDTeam.team_name == project_data.get("team_name")).first()
        if not team:
            print(f"Team '{project_data.get('team_name')}' not found. Skipping project insertion.")
            return None

        # NEW: Check if a project with the same name for this team exists.
        existing_project = db.query(FDProjectRegistry).filter(
            FDProjectRegistry.project_name == project_data.get("projectname"),
            FDProjectRegistry.team_id == team.team_id
        ).first()
        if existing_project:
            # Update the URLs of the existing project rather than creating a new one.
            existing_project.production_url = project_data.get("prod_url", "")
            existing_project.pre_production_url = project_data.get("pre_prod_url", "")
            existing_project.playground_url = project_data.get("pg_url", "")
            db.commit()
            db.refresh(existing_project)
            print("Updated existing project:", existing_project.project_name)
            return existing_project

        # Create a new project record with a generated UUID.
        new_project = FDProjectRegistry(
            project_uuid=str(uuid.uuid4()),
            project_name=project_data.get("projectname"),
            team_id=team.team_id,
            production_url=project_data.get("prod_url", ""),
            pre_production_url=project_data.get("pre_prod_url", ""),
            playground_url=project_data.get("pg_url", "")
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        print("Inserted project:", new_project.project_name)
        return new_project
    except SQLAlchemyError as e:
        db.rollback()
        print("Database error during project insertion:", e)
        raise e
