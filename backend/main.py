import os

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from starlette.middleware.sessions import SessionMiddleware

from routers import auth, collection, fountains, ratings, reviews, visits  # importing this also loads your .env (through db.py)

# The API docs (Swagger UI). On Vercel only /backend/* reaches this service, so the docs live at
# /backend/docs (served here as /api/docs) instead of FastAPI's default /docs, which Next.js would 404.
# "servers" makes the "Try it out" buttons call /backend/api/... on the same site, so your login cookie is used.
app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url="/api/openapi.json",
    servers=[{"url": "/backend"}],
)


@app.get("/api/docs", include_in_schema=False)
def swagger_docs():
    return get_swagger_ui_html(openapi_url="/backend/openapi.json", title="Zot Water API")


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
    if path.startswith("/backend/api/"):
        # the docs' "Try it out" calls /backend/api/x  ->  /api/x
        request.scope["path"] = path[len("/backend"):]
        request.scope["raw_path"] = request.scope["path"].encode()
    elif path.startswith("/backend/"):
        request.scope["path"] = "/api/" + path[len("/backend/"):]
        request.scope["raw_path"] = request.scope["path"].encode()
    return await call_next(request)

app.include_router(auth.router)
app.include_router(collection.router)
app.include_router(fountains.router)
app.include_router(ratings.router)
app.include_router(reviews.router)
app.include_router(visits.router)