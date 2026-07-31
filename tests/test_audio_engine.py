"""
Unit Tests for Audio Engine Services
"""

import pytest

from src.backend.services.audio_analyzer import AudioAnalyzer
from src.backend.services.producer_ai import ProducerAIService
from src.backend.services.viral_scanner import ViralScannerService


def test_bpm_and_key_detection(click_track_120bpm):
    meta = AudioAnalyzer.detect_bpm_and_key("synthetic_120bpm.wav", click_track_120bpm)
    assert "bpm" in meta
    # Beat trackers can lock onto a tempo octave (half/double); accept any
    # of them rather than assert an exact match to a single algorithm quirk.
    assert any(abs(meta["bpm"] - expected) < 4 for expected in (60.0, 120.0, 240.0))
    assert "key" in meta
    assert "scale" in meta
    assert meta["scale"] in ["Major", "Minor"]
    assert "dynamic_range_lufs" in meta
    assert "spectral_balance" in meta


def test_bpm_and_key_detection_requires_audio():
    with pytest.raises(ValueError):
        AudioAnalyzer.detect_bpm_and_key("no_audio.mp3", sample_data=None)


def test_bpm_and_key_detection_rejects_garbage_bytes():
    with pytest.raises(ValueError):
        AudioAnalyzer.detect_bpm_and_key(
            "not_audio.mp3", sample_data=b"this is not a real audio file"
        )


def test_vocal_reference_comparison():
    ref_meta = {"bpm": 140, "key": "8A (Am)"}
    sync_result = AudioAnalyzer.compare_reference_with_vocal(ref_meta, 140)
    assert sync_result["time_stretch_ratio"] == 1.0
    assert sync_result["target_bpm"] == 140


def test_producer_ai_response():
    response = ProducerAIService.process_artist_request(
        "Bana sert bir rage trap beat yap Travis Scott autotune olsun"
    )
    assert "producer_message" in response
    assert response["genre"] == "rage"
    assert response["beat_parameters"]["bpm"] == 150


def test_viral_scanner_recommendations():
    trends = ViralScannerService.get_viral_recommendations()
    assert len(trends) == 3
    assert trends[0]["viral_score"] > 90
    assert "title" in trends[0]
