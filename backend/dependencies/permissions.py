from fastapi import Depends, HTTPException
from .jwt_bearer import JWTBearer

def require_read_permission(payload: dict = Depends(JWTBearer())):
    # Allow if admin or have read permission
    if payload.get("flipdocs-admin") or payload.get("flipdocs-user-read"):
        return payload
    raise HTTPException(status_code=403, detail="Read permission required")

def require_write_permission(payload: dict = Depends(JWTBearer())):
    # Allow if admin or have write permission
    if payload.get("flipdocs-admin") or payload.get("flipdocs-user-write"):
        return payload
    raise HTTPException(status_code=403, detail="Write permission required")


def require_admin_permission(payload: dict = Depends(JWTBearer())):
    # Allow if admin
    if payload.get("flipdocs-admin"):
        return payload
    raise HTTPException(status_code=403, detail="Admin permission required")