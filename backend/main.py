import os

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from routers import auth, fountains, ratings, visits  # importing this also loads your .env (through db.py)

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="lax",
)

app.include_router(auth.router)
app.include_router(fountains.router)
app.include_router(ratings.router)
app.include_router(visits.router)