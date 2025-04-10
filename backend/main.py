from fastapi import FastAPI, HTTPException, Request
import httpx
import asyncio
import json
import re
from fastapi.middleware.cors import CORSMiddleware
from json.decoder import JSONDecodeError
from database.database import get_db, ProjectInfo
from pydantic import BaseModel
from routes.swagger import router as swagger_routes
from routes.config import router as config_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(swagger_routes)
app.include_router(config_routes)
