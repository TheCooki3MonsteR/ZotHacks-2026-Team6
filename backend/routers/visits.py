from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from db import get_session
from models import User, UserVisited, WaterFountain
from routers.auth import get_current_user

router = APIRouter(prefix="/api/fountains/{fountain_id}", tags=["visits"])


@router.post("/visit")
def record_visit(
    fountain_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Call this each time the logged-in user says "I went to this fountain".

    First time: creates the row with times_visited = 1.
    Every time after: adds 1 and updates last_visited.
    """
    if session.get(WaterFountain, fountain_id) is None:
        raise HTTPException(404, "Fountain not found.")

    visit = session.get(UserVisited, (user.user_id, fountain_id))
    if visit is None:
        # times_visited and last_visited fill themselves in (the table's defaults: 1 and now).
        visit = UserVisited(user_id=user.user_id, fountain_id=fountain_id)
        session.add(visit)
    else:
        # "column + 1" is done by the database itself, so two quick clicks can't overwrite each other.
        visit.times_visited = UserVisited.times_visited + 1
        visit.last_visited = func.now()
    session.commit()
    session.refresh(visit)  # re-read the row so we return the numbers the database actually saved

    return {
        "fountain_id": fountain_id,
        "times_visited": visit.times_visited,
        "last_visited": visit.last_visited,
    }
