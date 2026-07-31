"""
Unit Tests for Audio Engine Services
"""

import io

import pytest
import soundfile as sf

from src.backend.services.audio_analyzer import AudioAnalyzer
from src.backend.services.mastering_engine import MasteringEngine
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


def test_mastering_engine_processes_audio(click_track_120bpm):
    mastered_bytes, meta = MasteringEngine.master(click_track_120bpm, target_lufs=-9.0)

    assert mastered_bytes != click_track_120bpm
    processed, sr = sf.read(io.BytesIO(mastered_bytes))
    assert processed.size > 0
    assert sr > 0

    assert meta["target_lufs"] == -9.0
    assert "loudness_before_dbfs" in meta
    assert "loudness_after_dbfs" in meta
    assert len(meta["chain"]) == 7


def test_mastering_engine_moves_loudness_toward_target(quiet_tone_audio):
    # A sustained tone (not the sparse click track -- silence would dominate
    # its RMS and make the loudness comparison meaningless) so makeup gain
    # has a sensible, measurable effect.
    _, meta = MasteringEngine.master(quiet_tone_audio, target_lufs=-9.0)
    before_gap = abs(meta["loudness_before_dbfs"] - meta["target_lufs"])
    after_gap = abs(meta["loudness_after_dbfs"] - meta["target_lufs"])
    assert after_gap <= before_gap


def test_mastering_engine_requires_audio():
    with pytest.raises(ValueError):
        MasteringEngine.master(sample_data=None)


def test_mastering_engine_rejects_garbage_bytes():
    with pytest.raises(ValueError):
        MasteringEngine.master(sample_data=b"this is not a real audio file")


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
