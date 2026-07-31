"""
Auth Service
Password hashing (bcrypt, called directly -- passlib's bcrypt wrapper is
unmaintained and incompatible with current bcrypt releases) and JWT
issuance/verification for the register/login/me endpoints. Uses PyJWT
rather than python-jose -- python-jose pulls in `ecdsa`, which has a known
CVE (PYSEC-2026-1325) that trips pip-audit; PyJWT doesn't need it for the
HS256 algorithm this service uses.
"""

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt
from jwt import PyJWTError

from backend.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    token: str = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Returns the token payload, or None if the token is missing/expired/invalid."""
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except PyJWTError:
        return None
