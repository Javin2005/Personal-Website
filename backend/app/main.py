from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware

from .schemas import Project
from typing import List
import json

app = FastAPI()

origins = [
    "http://localhost:5173",
           ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    with open("app/data.json","r") as file:
        return json.load(file)


@app.get("/")
async def read_root():
    return {"Hello": "LTH Student"}

@app.get("/api/projects", response_model = List[Project])
def get_projects(language: str = None):
    data = load_data()["projects"]
    if language:
        return [p for p in data if language in p["tech_stack"]]
    
    return data
