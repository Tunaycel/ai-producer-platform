"""
Library router: a signed-in user's saved AI Producer Chat productions.
Every route requires auth and only ever touches the calling user's own rows.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.dependencies import get_current_user
from backend.models import ProductionRecord, User
from backend.schemas import ProductionCreate, ProductionResponse

router = APIRouter(prefix="/api/v1/library", tags=["library"])


@router.get("", response_model=list[ProductionResponse])
def list_productions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(ProductionRecord)
        .filter(ProductionRecord.user_id == current_user.id)
        .order_by(ProductionRecord.created_at.desc())
        .all()
    )


@router.post("", response_model=ProductionResponse, status_code=status.HTTP_201_CREATED)
def save_production(
    payload: ProductionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = ProductionRecord(user_id=current_user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{production_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_production(
    production_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.get(ProductionRecord, production_id)
    if record is None or record.user_id != current_user.id:
        # Same 404 whether it doesn't exist or belongs to someone else --
        # don't leak which productions exist for other users.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Production not found")

    db.delete(record)
    db.commit()
