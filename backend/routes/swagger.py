from fastapi import APIRouter, HTTPException, Request, Depends
from controllers.swaggerController import (
    get_all_swagger_docs,
    get_project_swagger_by_uuid_and_env,
    fetch_event_configs,
    post_event_configs,
    put_event_configs,
    patch_event_configs,
    delete_event_configs
)
from dependencies.jwt_bearer import JWTBearer
from dependencies.permissions import require_read_permission,require_admin_permission

router = APIRouter()

@router.get("/swagger/get/all",  dependencies=[Depends(require_admin_permission)])
async def route_get_all_swagger_docs():
    return await get_all_swagger_docs()

@router.get("/swagger/get/{uuid}/{env}", dependencies=[Depends(require_read_permission)])
async def route_get_project_swagger_by_uuid_and_env(uuid: str, env: str,user: dict = Depends(require_read_permission)):
    return await get_project_swagger_by_uuid_and_env(uuid, env,user)

@router.get("/swagger-fetch")
async def route_fetch_event_configs(request: Request):
    return await fetch_event_configs(request)

@router.post("/swagger-fetch")
async def route_post_event_configs(request: Request):
    return await post_event_configs(request)

@router.put("/swagger-fetch")
async def route_put_event_configs(request: Request):
    return await put_event_configs(request)

@router.patch("/swagger-fetch")
async def route_patch_event_configs(request: Request):
    return await patch_event_configs(request)

@router.delete("/swagger-fetch")
async def route_delete_event_configs(request: Request):
    return await delete_event_configs(request)
