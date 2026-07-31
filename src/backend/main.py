"""
AI Producer Platform Main Backend (FastAPI / HTTP Server)
"""

import os
import sys

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

# Ensure src module resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import Base, engine
from backend.routers import auth as auth_router
from backend.routers import library as library_router
from backend.services.audio_analyzer import AudioAnalyzer
from backend.services.mastering_engine import MasteringEngine
from backend.services.producer_ai import ProducerAIService
from backend.services.viral_scanner import ViralScannerService

app = FastAPI(
    title="AI Producer Platform API",
    description="Pro Level AI Music Producer & Vocal Mixing Platform for Artists",
    version="1.0.0",
)

# Dev/MVP schema management: create tables if they don't exist yet.
# A real migration tool (Alembic) is the next step once the schema needs to
# evolve under existing data -- tracked in ROADMAP.md, not silently deferred.
Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(library_router.router)

# Enable CORS for frontend interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory path
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")


@app.get("/api/v1/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "engine": "AI Producer Master Engine v1.0",
        "quality": "Pro Studio Grade",
    }


@app.post("/api/v1/producer/chat")
def producer_chat(payload: dict):
    """
    Main dialogue endpoint for AI Producer instructions.
    """
    message = payload.get("message", "")
    has_vocal = payload.get("has_vocal", False)
    reference_meta = payload.get("reference_meta")

    if not message:
        raise HTTPException(status_code=400, detail="Message prompt cannot be empty")

    result = ProducerAIService.process_artist_request(
        prompt=message, vocal_present=has_vocal, reference_audio_meta=reference_meta
    )
    return JSONResponse(content=result)


@app.post("/api/v1/audio/analyze-reference")
async def analyze_reference(file: UploadFile = File(...)):
    """
    Analyzes uploaded reference audio track for BPM, Key, and Energy.
    """
    content = await file.read()
    try:
        analysis = AudioAnalyzer.detect_bpm_and_key(
            filename=file.filename or "", sample_data=content
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return JSONResponse(content=analysis)


@app.post("/api/v1/audio/master")
async def master_audio(
    file: UploadFile = File(...),
    target_lufs: float = Query(default=-9.0, ge=-24.0, le=-4.0),
):
    """
    Runs uploaded audio through a real EQ/compression/limiting DSP chain
    (see MasteringEngine) and returns the processed WAV. Never returns the
    raw upload unprocessed -- RULES.md #1.
    """
    content = await file.read()
    try:
        mastered_bytes, meta = MasteringEngine.master(sample_data=content, target_lufs=target_lufs)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return Response(
        content=mastered_bytes,
        media_type="audio/wav",
        headers={
            "X-Loudness-Before-Dbfs": str(meta["loudness_before_dbfs"]),
            "X-Loudness-After-Dbfs": str(meta["loudness_after_dbfs"]),
            "X-Target-Lufs": str(meta["target_lufs"]),
            "X-Mastering-Chain": " | ".join(meta["chain"]),
        },
    )


@app.get("/api/v1/trends/viral-beats")
def get_viral_trends(genre: str = "rap"):
    """
    Returns viral beat recommendations from TikTok / Spotify / YouTube charts.
    """
    recommendations = ViralScannerService.get_viral_recommendations(artist_style=genre)
    return JSONResponse(content={"trends": recommendations})


# Mount frontend static files if present
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/", response_class=HTMLResponse)
    def serve_frontend():
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            with open(index_path, encoding="utf-8") as f:
                return f.read()
        return "<h1>AI Producer Platform Backend Online</h1>"
