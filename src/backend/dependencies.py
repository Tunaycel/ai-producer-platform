"""Shared FastAPI dependencies: DB session (re-exported) and the current authenticated user."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import User
from backend.services.auth_service import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise unauthorized

    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise unauthorized

    user = db.get(User, int(payload["sub"]))
    if user is None:
        raise unauthorized

    return user
