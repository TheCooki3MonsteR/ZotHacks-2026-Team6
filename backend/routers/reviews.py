from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import and_, exists, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db import get_session
from models import Collectible, Rating, Review, User, UserCollectible, UserVisited, WaterFountain
from routers.auth import get_current_user
from routers.collection import sticker_json

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
    items = [
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

    # Star-only ratings (no written review): still show who rated it and how many stars.
    star_only = session.execute(
        select(Rating, User.username)
        .join(User, User.user_id == Rating.user_id)
        .where(
            Rating.fountain_id == fountain_id,
            ~exists().where(
                Review.user_id == Rating.user_id, Review.fountain_id == Rating.fountain_id
            ),
        )
    ).all()
    items += [
        {
            "review_id": None,  # no written review behind this one
            "username": username,
            "rating": float(rating.rating),
            "body": "",
            "created_at": rating.rated_at,
            "is_mine": rating.user_id == me,
        }
        for rating, username in star_only
    ]

    items.sort(key=lambda i: i["created_at"], reverse=True)  # newest first, text or not
    return items


# ---------- logged-in users only ----------

@router.post("/fountains/{fountain_id}/reviews", status_code=201)
def add_review(
    fountain_id: int,
    body: ReviewIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Write a review: stars + text, saved together or not at all.

    Posting a review also (a) counts as one more visit to this fountain and
    (b) unlocks this fountain's sticker(s) if the user doesn't have them yet.
    """
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

    # 3) count it as a visit: first time creates the row, later ones add 1 (the database does the +1)
    visit = session.get(UserVisited, (user.user_id, fountain_id))
    if visit is None:
        visit = UserVisited(user_id=user.user_id, fountain_id=fountain_id)
        session.add(visit)
    else:
        visit.times_visited = UserVisited.times_visited + 1
        visit.last_visited = func.now()

    # 4) unlock this fountain's stickers that the user doesn't own yet
    owned = set(
        session.scalars(
            select(UserCollectible.collectible_id).where(UserCollectible.user_id == user.user_id)
        )
    )
    new_stickers = [
        sticker
        for sticker in session.scalars(
            select(Collectible)
            .where(Collectible.fountain_id == fountain_id)
            .order_by(Collectible.collectible_id)
        )
        if sticker.collectible_id not in owned
    ]
    for sticker in new_stickers:
        session.add(UserCollectible(user_id=user.user_id, collectible_id=sticker.collectible_id))

    # One commit for everything, so a failure can't leave stars without a review (or the reverse).
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        # Two requests at the same instant can both pass the check above; the database rule stops the second.
        if getattr(error.orig, "sqlstate", None) == "23505":
            raise HTTPException(409, ALREADY_REVIEWED)
        raise
    session.refresh(review)  # fills in review_id and created_at, which the database creates
    session.refresh(visit)  # the visit count as the database saved it

    return {
        "review_id": review.review_id,
        "username": user.username,
        "rating": body.rating,
        "body": review.body,
        "created_at": review.created_at,
        "is_mine": True,
        "times_visited": visit.times_visited,  # the user's updated "I used this fountain" count
        "stickers": [sticker_json(s) for s in new_stickers],  # only the ones unlocked just now
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


@router.put("/reviews/{review_id}")
def update_my_review(
    review_id: int,
    body: ReviewIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Edit one of YOUR reviews: the new text and the new stars are saved together."""
    review = session.get(Review, review_id)
    # Someone else's review gets the same answer as one that doesn't exist.
    if review is None or review.user_id != user.user_id:
        raise HTTPException(404, "Review not found, or it isn't yours.")

    text = body.body.strip()
    if not text:
        raise HTTPException(400, "Review can't be blank.")

    review.body = text
    rating_row = session.get(Rating, (user.user_id, review.fountain_id))
    if rating_row is None:
        session.add(Rating(user_id=user.user_id, fountain_id=review.fountain_id, rating=body.rating))
    else:
        rating_row.rating = body.rating
        rating_row.rated_at = func.now()
    session.commit()  # text and stars change together
    session.refresh(review)

    return {
        "review_id": review.review_id,
        "fountain_id": review.fountain_id,
        "rating": body.rating,
        "body": review.body,
        "created_at": review.created_at,
    }


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
