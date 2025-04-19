from fastapi import APIRouter, UploadFile, File, HTTPException
import csv, io
from controllers.projectController import addProject  # Direct import

router = APIRouter()

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="CSV file is required")
    content = await file.read()
    try:
        decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            decoded = content.decode('cp1252')
        except UnicodeDecodeError:
            decoded = content.decode('latin-1')  # fallback encoding that maps every byte
            
    file_stream = io.StringIO(decoded, newline='')
    csv_reader = csv.DictReader(file_stream)
    projects = []
    row_count = 0
    for row in csv_reader:
        row_count += 1
        print(f"Processing row {row_count}: {row}")
        if not row.get("projectname"):
            print(f"Skipping row {row_count} as projectname is missing")
            continue
        projects.append({
            "projectname": row.get("projectname"),
            "team_name": row.get("team_name"),
            "pre_prod_url": row.get("pre_prod_url", ""),
            "prod_url": row.get("prod_url", ""),
            "pg_url": row.get("pg_url", "")
        })
    print(f"Total valid rows parsed: {len(projects)}")
    for i, proj in enumerate(projects, start=1):
        updatedProject=addProject(proj)

        print(f"Inserted project {i}/{len(projects)}")
    return {"message": "Projects uploaded and processed successfully."}
