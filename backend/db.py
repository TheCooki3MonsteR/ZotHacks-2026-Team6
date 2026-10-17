import os
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Always read the .env that sits next to this file, no matter where you start the server from.
load_dotenv(Path(__file__).parent / ".env")

def _clean_url(url: str, scheme: str) -> str:
    """Fix the Supabase/Vercel connection string so our libraries accept it.

    - Vercel gives "postgres://..."; we need the scheme our driver expects.
    - Vercel adds a "supa=..." option that the Postgres driver rejects, so drop it.
    """
    parts = urlsplit(url.strip().strip('"'))
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "supa"]
    return urlunsplit((scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

_RAW_URL = os.getenv("ZOTWATER_POSTGRES_URL")
if not _RAW_URL:
    raise RuntimeError(
        "ZOTWATER_POSTGRES_URL is not set. Check that backend/.env exists and has that line."
    )

# Plain connection string, used by get_db() (raw SQL).
DATABASE_URL = _clean_url(_RAW_URL, "postgresql")

# ORM engine: "postgresql+psycopg" means "Postgres, using the psycopg driver".
# prepare_threshold=None is needed for Supabase's pooled connections.
engine = create_engine(
    _clean_url(_RAW_URL, "postgresql+psycopg"),
    connect_args={"prepare_threshold": None},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

def get_session():
    """FastAPI dependency: gives an endpoint a database session, then closes it."""
    with SessionLocal() as session:
        yield session