from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_session
from models import WaterFountain

router = APIRouter(prefix="/api/fountains", tags=["fountains"])


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
