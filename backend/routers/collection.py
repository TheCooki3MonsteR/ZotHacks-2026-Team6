from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db import get_session
from models import Collectible, User, UserCollectible, UserVisited, WaterFountain
from routers.auth import get_current_user

router = APIRouter(prefix="/api/me", tags=["collection"])


def sticker_json(sticker: Collectible, obtained_at=None) -> dict:
    return {
        "collectible_id": sticker.collectible_id,
        "fountain_id": sticker.fountain_id,
        "name": sticker.name,
        "image_path": sticker.image_path,  # a file in frontend/public, e.g. "collectibles/petr.png"
        "rarity": sticker.rarity,
        "obtained_at": obtained_at,
    }


@router.get("/visits")
def my_visits(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Every fountain the logged-in user has used, with how many times (newest first)."""
    rows = session.execute(
        select(UserVisited, WaterFountain)
        .join(WaterFountain, WaterFountain.fountain_id == UserVisited.fountain_id)
        .where(UserVisited.user_id == user.user_id)
        .order_by(UserVisited.last_visited.desc())
    ).all()
    return [
        {
            "fountain_id": visit.fountain_id,
            "name": fountain.name,
            "latitude": float(fountain.latitude) if fountain.latitude is not None else None,
            "longitude": float(fountain.longitude) if fountain.longitude is not None else None,
            "times_visited": visit.times_visited,
            "last_visited": visit.last_visited,
        }
        for visit, fountain in rows
    ]


@router.get("/collectibles")
def my_collectibles(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """The stickers the logged-in user owns, plus how many exist in total."""
    rows = session.execute(
        select(Collectible, UserCollectible.obtained_at)
        .join(UserCollectible, UserCollectible.collectible_id == Collectible.collectible_id)
        .where(UserCollectible.user_id == user.user_id)
        .order_by(UserCollectible.obtained_at.desc(), Collectible.collectible_id)
    ).all()
    total = session.scalar(select(func.count()).select_from(Collectible))
    return {"total": total, "owned": [sticker_json(c, when) for c, when in rows]}
