import os

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from routers import auth, collection, fountains, ratings, reviews, visits  # importing this also loads your .env (through db.py)

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="lax",
)

@app.middleware("http")
async def backend_prefix(request, call_next):
    # On Vercel, /backend/* goes straight to this service with the path unchanged
    # (see vercel.json), so map /backend/x -> /api/x. Locally, Next.js already
    # rewrites to /api/x, so this never runs there.
    path = request.scope["path"]
    if path.startswith("/backend/"):
        request.scope["path"] = "/api/" + path[len("/backend/"):]
        request.scope["raw_path"] = request.scope["path"].encode()
    return await call_next(request)

app.include_router(auth.router)
app.include_router(collection.router)
app.include_router(fountains.router)
app.include_router(ratings.router)
app.include_router(reviews.router)
app.include_router(visits.router)