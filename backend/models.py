"""ORM models: one Python class per table in the Supabase database.

These classes DESCRIBE tables that already exist. They do not create or change
anything in the database. If your teammate changes a table in Supabase
(for example adds a review text column), update the matching class here.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Every model inherits from this."""


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)  # holds the scrypt HASH, never the real password
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    ratings: Mapped[list["Rating"]] = relationship(back_populates="user")
    visits: Mapped[list["UserVisited"]] = relationship(back_populates="user")


class WaterFountain(Base):
    __tablename__ = "water_fountains"

    fountain_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric)
    description: Mapped[str] = mapped_column(Text)

    ratings: Mapped[list["Rating"]] = relationship(back_populates="fountain")
    visits: Mapped[list["UserVisited"]] = relationship(back_populates="fountain")


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (CheckConstraint("rating >= 1 AND rating <= 5", name="ratings_rating_check"),)

    # Two columns together are the primary key: one rating per user per fountain.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    fountain_id: Mapped[int] = mapped_column(ForeignKey("water_fountains.fountain_id"), primary_key=True)
    rating: Mapped[Decimal] = mapped_column(Numeric)
    rated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="ratings")
    fountain: Mapped["WaterFountain"] = relationship(back_populates="ratings")


class UserVisited(Base):
    __tablename__ = "user_visited"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    fountain_id: Mapped[int] = mapped_column(ForeignKey("water_fountains.fountain_id"), primary_key=True)
    times_visited: Mapped[int] = mapped_column(Integer, server_default="1")
    last_visited: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="visits")
    fountain: Mapped["WaterFountain"] = relationship(back_populates="visits")


class Review(Base):
    """A written review. The stars for it live in Rating (same user + same fountain)."""

    __tablename__ = "reviews"
    # One review per person per fountain.
    __table_args__ = (UniqueConstraint("user_id", "fountain_id", name="reviews_user_fountain_unique"),)

    review_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    fountain_id: Mapped[int] = mapped_column(ForeignKey("water_fountains.fountain_id"))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Collectible(Base):
    """A sticker (e.g. 'Beanie Petr'). image_path is a file under frontend/public/ (e.g. collectibles/petr.png)."""

    __tablename__ = "collectibles"

    collectible_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fountain_id: Mapped[int] = mapped_column(ForeignKey("water_fountains.fountain_id"))
    name: Mapped[str] = mapped_column(Text, unique=True)
    image_path: Mapped[str] = mapped_column(Text)
    rarity: Mapped[str | None] = mapped_column(Text)


class UserCollectible(Base):
    """Which user owns which sticker. One row per (user, sticker), so you can't get the same one twice."""

    __tablename__ = "user_collectibles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    collectible_id: Mapped[int] = mapped_column(ForeignKey("collectibles.collectible_id"), primary_key=True)
    obtained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
