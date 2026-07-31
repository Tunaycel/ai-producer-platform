"""
Integration Tests for FastAPI Backend Endpoints
"""

import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src.backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "engine" in data


def test_producer_chat_endpoint():
    payload = {
        "message": "Bana sert bir rage trap beat yap",
        "has_vocal": False,
        "reference_meta": None,
    }
    response = client.post("/api/v1/producer/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "producer_message" in data
    assert "beat_parameters" in data
    assert "genre" in data


def test_producer_chat_with_reference():
    payload = {
        "message": "dark trap altyapısı istiyorum",
        "has_vocal": True,
        "reference_meta": {"bpm": 140, "key": "8A (Am)"},
    }
    response = client.post("/api/v1/producer/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["beat_parameters"]["bpm"] == 140
    assert data["beat_parameters"]["key"] == "8A (Am)"


def test_producer_chat_empty_message():
    payload = {"message": ""}
    response = client.post("/api/v1/producer/chat", json=payload)
    assert response.status_code == 400


def test_analyze_reference_endpoint(click_track_120bpm):
    files = {"file": ("synthetic_120bpm.wav", click_track_120bpm, "audio/wav")}
    response = client.post("/api/v1/audio/analyze-reference", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "bpm" in data
    assert "key" in data


def test_analyze_reference_endpoint_rejects_invalid_audio():
    files = {"file": ("not_audio.txt", b"definitely not audio", "text/plain")}
    response = client.post("/api/v1/audio/analyze-reference", files=files)
    assert response.status_code == 400


def test_viral_trends_endpoint():
    response = client.get("/api/v1/trends/viral-beats")
    assert response.status_code == 200
    data = response.json()
    assert "trends" in data
    assert len(data["trends"]) == 3
    assert data["trends"][0]["viral_score"] > 85


def test_viral_trends_with_genre_param():
    response = client.get("/api/v1/trends/viral-beats?genre=drill")
    assert response.status_code == 200
    data = response.json()
    assert "trends" in data
