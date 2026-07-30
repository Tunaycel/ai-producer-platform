"""
Unit Tests for Audio Engine Services
"""
import pytest
from src.backend.services.audio_analyzer import AudioAnalyzer
from src.backend.services.producer_ai import ProducerAIService
from src.backend.services.viral_scanner import ViralScannerService

def test_bpm_and_key_detection():
    meta = AudioAnalyzer.detect_bpm_and_key("travis_scott_reference.mp3")
    assert "bpm" in meta
    assert 120 <= meta["bpm"] <= 165
    assert "key" in meta
    assert "scale" in meta
    assert meta["scale"] in ["Major", "Minor"]

def test_vocal_reference_comparison():
    ref_meta = {"bpm": 140, "key": "8A (Am)"}
    sync_result = AudioAnalyzer.compare_reference_with_vocal(ref_meta, 140)
    assert sync_result["time_stretch_ratio"] == 1.0
    assert sync_result["target_bpm"] == 140

def test_producer_ai_response():
    response = ProducerAIService.process_artist_request("Bana sert bir rage trap beat yap Travis Scott autotune olsun")
    assert "producer_message" in response
    assert response["genre"] == "rage"
    assert response["beat_parameters"]["bpm"] == 150

def test_viral_scanner_recommendations():
    trends = ViralScannerService.get_viral_recommendations()
    assert len(trends) == 3
    assert trends[0]["viral_score"] > 90
    assert "title" in trends[0]
