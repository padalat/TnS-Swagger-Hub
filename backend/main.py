from fastapi import FastAPI, HTTPException, Request
import httpx
import asyncio
import json
import re
from fastapi.middleware.cors import CORSMiddleware
from json.decoder import JSONDecodeError
from database.database import get_db, ProjectInfo
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers from controllers
from controller.swaggerControll import router as swagger_router
from controller.configControll import router as config_router

app.include_router(swagger_router)
app.include_router(config_router)
