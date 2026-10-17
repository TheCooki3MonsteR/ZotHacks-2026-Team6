from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db import get_session
from models import Rating, WaterFountain

router = APIRouter(prefix="/api/fountains", tags=["fountains"])


@router.get("")
def list_fountains(session: Session = Depends(get_session)):
    """Every fountain with its average star rating (for coloring the map pins)."""
    rows = session.execute(
        select(WaterFountain, func.avg(Rating.rating), func.count(Rating.user_id))
        .outerjoin(Rating, Rating.fountain_id == WaterFountain.fountain_id)
        .group_by(WaterFountain.fountain_id)
        .order_by(WaterFountain.fountain_id)
    ).all()
    return [
        {
            "fountain_id": f.fountain_id,
            "name": f.name,
            "latitude": float(f.latitude) if f.latitude is not None else None,
            "longitude": float(f.longitude) if f.longitude is not None else None,
            "avg_rating": round(float(avg), 2) if avg is not None else 0,
            "rating_count": count,
        }
        for f, avg, count in rows
    ]


@router.get("/{fountain_id}")
def get_fountain(fountain_id: int, session: Session = Depends(get_session)):
    """Details for one fountain, including its description. Anyone can read this."""
    fountain = session.get(WaterFountain, fountain_id)
    if fountain is None:
        raise HTTPException(404, "Fountain not found.")

    return {
        "fountain_id": fountain.fountain_id,
        "name": fountain.name,
        "latitude": float(fountain.latitude) if fountain.latitude is not None else None,
        "longitude": float(fountain.longitude) if fountain.longitude is not None else None,
        "description": fountain.description,
    }
