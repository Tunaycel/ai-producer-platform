"""
AI Producer Platform Main Backend (FastAPI / HTTP Server)
"""

import os
import sys

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Ensure src module resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.audio_analyzer import AudioAnalyzer
from backend.services.producer_ai import ProducerAIService
from backend.services.viral_scanner import ViralScannerService

app = FastAPI(
    title="AI Producer Platform API",
    description="Pro Level AI Music Producer & Vocal Mixing Platform for Artists",
    version="1.0.0",
)

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
