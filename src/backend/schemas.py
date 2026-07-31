"""Pydantic request/response schemas for the auth and library endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    display_name: str = Field(min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    prompt: str
    genre: str
    beat_parameters: dict[str, Any]
    recommended_vocal_chain: str
    mastering_target: str


class ProductionResponse(BaseModel):
    id: int
    title: str
    prompt: str
    genre: str
    beat_parameters: dict[str, Any]
    recommended_vocal_chain: str
    mastering_target: str
    created_at: datetime

    model_config = {"from_attributes": True}
