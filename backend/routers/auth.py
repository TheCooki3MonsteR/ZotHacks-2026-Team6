import hashlib
import hmac
import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db import get_session
from models import User

router = APIRouter(prefix="/api", tags=["auth"])


class Credentials(BaseModel):
    username: str
    password: str


# ---------- passwords ----------

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
        digest = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1, dklen=32
        )
        return hmac.compare_digest(digest, bytes.fromhex(digest_hex))
    except ValueError:
        return False


# Used when the username doesn't exist, so a wrong username takes as long as a
# wrong password and nobody can use timing to find out which usernames are real.
DUMMY_HASH = hash_password("not-a-real-password")


# ---------- sign up ----------

@router.post("/register", status_code=201)
def register(creds: Credentials, request: Request, session: Session = Depends(get_session)):
    username = creds.username.strip().lower()

    if not re.match(r"^[a-z0-9_]{3,30}$", username):
        raise HTTPException(400, "Username must be 3-30 letters, numbers or underscores.")
    if not 8 <= len(creds.password) <= 128:
        raise HTTPException(400, "Password must be 8 to 128 characters.")

    user = User(username=username, password=hash_password(creds.password))
    session.add(user)
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        # Postgres error code 23505 means "unique violation": the username already exists.
        if getattr(error.orig, "sqlstate", None) == "23505":
            raise HTTPException(409, "That username is taken.")
        raise  # anything else is a real problem, don't hide it

    request.session.clear()
    request.session["user_id"] = user.user_id  # signing up also logs you in
    return {"user_id": user.user_id, "username": user.username}


# ---------- login ----------

@router.post("/login")
def login(creds: Credentials, request: Request, session: Session = Depends(get_session)):
    username = creds.username.strip().lower()

    user = session.scalar(select(User).where(User.username == username))

    ok = verify_password(creds.password, user.password if user else DUMMY_HASH)
    if user is None or not ok:
        raise HTTPException(401, "Invalid username or password.")

    request.session.clear()
    request.session["user_id"] = user.user_id
    return {"user_id": user.user_id, "username": user.username}


# ---------- logout ----------

@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "logged out"}


# ---------- who am I? ----------

def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    """Other routers use this to require a logged-in user: user: User = Depends(get_current_user)"""
    user_id = request.session.get("user_id")
    user = session.get(User, user_id) if user_id else None
    if user is None:
        request.session.clear()
        raise HTTPException(401, "Please log in first.")
    return user


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"user_id": user.user_id, "username": user.username}
