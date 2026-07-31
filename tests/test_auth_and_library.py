"""
Integration Tests for Auth (register/login/me) and Library endpoints.
Runs against a real (sqlite) database via the app's own SQLAlchemy models
-- not mocked, per RULES.md #5 (no faking behavior that has real logic).
"""

import uuid

from fastapi.testclient import TestClient

from src.backend.main import app

client = TestClient(app)


def _register(
    email: str | None = None, password: str = "hunter22", display_name: str = "Artist"
) -> dict:
    email = email or f"{uuid.uuid4().hex}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "display_name": display_name},
    )
    assert response.status_code == 201, response.text
    return {"email": email, "password": password, "token": response.json()["access_token"]}


def test_register_returns_token():
    user = _register()
    assert user["token"]


def test_register_rejects_duplicate_email():
    user = _register()
    response = client.post(
        "/api/v1/auth/register",
        json={"email": user["email"], "password": "anotherpass1", "display_name": "Someone Else"},
    )
    assert response.status_code == 409


def test_register_rejects_short_password():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{uuid.uuid4().hex}@example.com",
            "password": "short",
            "display_name": "Artist",
        },
    )
    assert response.status_code == 422


def test_login_with_correct_credentials():
    user = _register()
    response = client.post(
        "/api/v1/auth/login", json={"email": user["email"], "password": user["password"]}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_rejects_wrong_password():
    user = _register()
    response = client.post(
        "/api/v1/auth/login", json={"email": user["email"], "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_requires_auth():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user():
    user = _register(display_name="Test Producer")
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user['token']}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user["email"]
    assert data["display_name"] == "Test Producer"


def _production_payload() -> dict:
    return {
        "title": "Dark Trap Session",
        "prompt": "Give me a dark trap instrumental",
        "genre": "dark trap",
        "beat_parameters": {"bpm": 140, "key": "A Minor"},
        "recommended_vocal_chain": "Natural Hard Tune, High-pass filter @ 120Hz",
        "mastering_target": "-9.0 LUFS (Club/Streaming Ready)",
    }


def test_library_requires_auth():
    response = client.get("/api/v1/library")
    assert response.status_code == 401
    response = client.post("/api/v1/library", json=_production_payload())
    assert response.status_code == 401


def test_library_save_and_list():
    user = _register()
    headers = {"Authorization": f"Bearer {user['token']}"}

    create_response = client.post("/api/v1/library", json=_production_payload(), headers=headers)
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == "Dark Trap Session"
    assert created["beat_parameters"]["bpm"] == 140

    list_response = client.get("/api/v1/library", headers=headers)
    assert list_response.status_code == 200
    productions = list_response.json()
    assert len(productions) == 1
    assert productions[0]["id"] == created["id"]


def test_library_is_isolated_per_user():
    user_a = _register()
    user_b = _register()

    client.post(
        "/api/v1/library",
        json=_production_payload(),
        headers={"Authorization": f"Bearer {user_a['token']}"},
    )

    response = client.get("/api/v1/library", headers={"Authorization": f"Bearer {user_b['token']}"})
    assert response.status_code == 200
    assert response.json() == []


def test_library_delete_removes_entry():
    user = _register()
    headers = {"Authorization": f"Bearer {user['token']}"}
    created = client.post("/api/v1/library", json=_production_payload(), headers=headers).json()

    delete_response = client.delete(f"/api/v1/library/{created['id']}", headers=headers)
    assert delete_response.status_code == 204

    list_response = client.get("/api/v1/library", headers=headers)
    assert list_response.json() == []


def test_library_delete_rejects_other_users_production():
    user_a = _register()
    user_b = _register()
    headers_a = {"Authorization": f"Bearer {user_a['token']}"}
    headers_b = {"Authorization": f"Bearer {user_b['token']}"}

    created = client.post("/api/v1/library", json=_production_payload(), headers=headers_a).json()

    delete_response = client.delete(f"/api/v1/library/{created['id']}", headers=headers_b)
    assert delete_response.status_code == 404

    # Confirm it's untouched from the owner's side.
    list_response = client.get("/api/v1/library", headers=headers_a)
    assert len(list_response.json()) == 1
