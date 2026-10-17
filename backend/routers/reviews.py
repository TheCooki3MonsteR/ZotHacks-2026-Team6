from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db import get_session
from models import Rating, Review, User, WaterFountain
from routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["reviews"])

ALREADY_REVIEWED = "You already reviewed this fountain. Delete your review to write a new one."


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)  # the stars
    body: str = Field(min_length=1, max_length=1000)  # the text


# ---------- anyone can read ----------

@router.get("/fountains/{fountain_id}/reviews")
def list_reviews(fountain_id: int, request: Request, session: Session = Depends(get_session)):
    """All reviews for one fountain, newest first, each with the author's stars."""
    if session.get(WaterFountain, fountain_id) is None:
        raise HTTPException(404, "Fountain not found.")

    rows = session.execute(
        select(Review, User.username, Rating.rating)
        .join(User, User.user_id == Review.user_id)
        # The stars live in the ratings table: match the same person AND the same fountain.
        .outerjoin(
            Rating,
            and_(Rating.user_id == Review.user_id, Rating.fountain_id == Review.fountain_id),
        )
        .where(Review.fountain_id == fountain_id)
        .order_by(Review.created_at.desc(), Review.review_id.desc())
    ).all()

    me = request.session.get("user_id")  # None if nobody is logged in
    return [
        {
            "review_id": review.review_id,
            "username": username,
            "rating": float(stars) if stars is not None else None,
            "body": review.body,
            "created_at": review.created_at,
            "is_mine": review.user_id == me,  # lets the frontend show a Delete button
        }
        for review, username, stars in rows
    ]


# ---------- logged-in users only ----------

@router.post("/fountains/{fountain_id}/reviews", status_code=201)
def add_review(
    fountain_id: int,
    body: ReviewIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Write a review: stars + text, saved together or not at all."""
    if session.get(WaterFountain, fountain_id) is None:
        raise HTTPException(404, "Fountain not found.")

    text = body.body.strip()
    if not text:
        raise HTTPException(400, "Review can't be blank.")

    already = session.scalar(
        select(Review.review_id).where(
            Review.user_id == user.user_id, Review.fountain_id == fountain_id
        )
    )
    if already is not None:
        raise HTTPException(409, ALREADY_REVIEWED)

    # 1) the stars: add or update this person's row in ratings (same idea as set_my_rating)
    rating_row = session.get(Rating, (user.user_id, fountain_id))
    if rating_row is None:
        session.add(Rating(user_id=user.user_id, fountain_id=fountain_id, rating=body.rating))
    else:
        rating_row.rating = body.rating
        rating_row.rated_at = func.now()

    # 2) the text
    review = Review(user_id=user.user_id, fountain_id=fountain_id, body=text)
    session.add(review)

    # One commit for both, so a failure can't leave stars without a review (or the reverse).
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        # Two requests at the same instant can both pass the check above; the database rule stops the second.
        if getattr(error.orig, "sqlstate", None) == "23505":
            raise HTTPException(409, ALREADY_REVIEWED)
        raise
    session.refresh(review)  # fills in review_id and created_at, which the database creates

    return {
        "review_id": review.review_id,
        "username": user.username,
        "rating": body.rating,
        "body": review.body,
        "created_at": review.created_at,
        "is_mine": True,
    }


@router.delete("/reviews/{review_id}")
def delete_my_review(
    review_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete one of YOUR reviews, and your stars for that fountain with it."""
    review = session.get(Review, review_id)
    # Someone else's review gets the same answer as one that doesn't exist.
    if review is None or review.user_id != user.user_id:
        raise HTTPException(404, "Review not found, or it isn't yours.")

    rating_row = session.get(Rating, (user.user_id, review.fountain_id))
    if rating_row is not None:
        session.delete(rating_row)
    session.delete(review)
    session.commit()  # both deletes happen together
    return {"status": "deleted"}


@router.get("/me/reviews")
def my_reviews(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Every review the logged-in user has written (used for the 'reviews written' count)."""
    rows = session.execute(
        select(Review, Rating.rating)
        .outerjoin(
            Rating,
            and_(Rating.user_id == Review.user_id, Rating.fountain_id == Review.fountain_id),
        )
        .where(Review.user_id == user.user_id)
        .order_by(Review.created_at.desc(), Review.review_id.desc())
    ).all()
    return [
        {
            "review_id": review.review_id,
            "fountain_id": review.fountain_id,
            "rating": float(stars) if stars is not None else None,
            "body": review.body,
            "created_at": review.created_at,
        }
        for review, stars in rows
    ]
