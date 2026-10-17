from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db import get_session
from models import Rating, User, WaterFountain
from routers.auth import get_current_user

router = APIRouter(prefix="/api/fountains/{fountain_id}", tags=["ratings"])

class RatingIn(BaseModel):
    rating: int = Field(ge=1, le=5)  # FastAPI rejects 0, 6, text, etc. automatically


def require_fountain(session: Session, fountain_id: int) -> None:
    if session.get(WaterFountain, fountain_id) is None:
        raise HTTPException(404, "Fountain not found.")


# ---------- anyone can see the average ----------

@router.get("/rating")
def rating_summary(fountain_id: int, request: Request, session: Session = Depends(get_session)):
    require_fountain(session, fountain_id)

    average, count = session.execute(
        select(func.avg(Rating.rating), func.count()).where(Rating.fountain_id == fountain_id)
    ).one()

    # If the visitor is logged in, also say what THEY gave it.
    my_rating = None
    user_id = request.session.get("user_id")
    if user_id:
        mine = session.get(Rating, (user_id, fountain_id))
        my_rating = float(mine.rating) if mine else None

    return {
        "fountain_id": fountain_id,
        "average": round(float(average), 1) if average is not None else None,
        "count": count,
        "my_rating": my_rating,
    }


# ---------- logged-in users only ----------

@router.put("/rating")
def set_my_rating(
    fountain_id: int,
    body: RatingIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Give a rating, or change the one you already gave (one per person per fountain)."""
    require_fountain(session, fountain_id)

    row = session.get(Rating, (user.user_id, fountain_id))
    if row is None:
        session.add(Rating(user_id=user.user_id, fountain_id=fountain_id, rating=body.rating))
    else:
        row.rating = body.rating
        row.rated_at = func.now()
    session.commit()

    return {"fountain_id": fountain_id, "my_rating": body.rating}


@router.delete("/rating")
def delete_my_rating(
    fountain_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Remove YOUR rating. The row is looked up with your own user_id, so you can't touch anyone else's."""
    row = session.get(Rating, (user.user_id, fountain_id))
    if row is None:
        raise HTTPException(404, "You haven't rated this fountain.")
    session.delete(row)
    session.commit()
    return {"status": "deleted"}
