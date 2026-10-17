import os
from dotenv import load_dotenv

from fastapi import FastAPI

app = FastAPI()

load_dotenv()                       # reads .env from the current folder

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}