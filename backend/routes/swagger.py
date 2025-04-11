from fastapi import APIRouter, HTTPException, Request
from controllers.swaggerController import (
    get_all_swagger,
    get_swagger_by_uuid,
    fetch_event_configs,
    post_event_configs,
    put_event_configs,
    patch_event_configs,
    delete_event_configs
)

router = APIRouter()

@router.get("/swagger/get/all")
async def route_get_all_swagger():
    return await get_all_swagger()

@router.get("/swagger/get/{uuid}/{env}")
async def route_get_swagger_by_uuid(uuid: str, env: str):
    return await get_swagger_by_uuid(uuid, env)

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
