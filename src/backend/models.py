"""
SQLAlchemy ORM models: registered users and their saved productions
(the "library" -- past AI Producer Chat sessions a user chose to keep).
"""

from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    productions: Mapped[list["ProductionRecord"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class ProductionRecord(Base):
    """One saved AI Producer Chat result -- a library entry a user can revisit."""

    __tablename__ = "production_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    genre: Mapped[str] = mapped_column(String(80), nullable=False)
    beat_parameters: Mapped[dict] = mapped_column(JSON, nullable=False)
    recommended_vocal_chain: Mapped[str] = mapped_column(Text, nullable=False)
    mastering_target: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="productions")
