"""Shared pytest fixtures for audio- and API-related tests."""

import io
import os
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

# Must run before any `backend.*` module is imported anywhere (including by
# other test modules) -- config.Settings() reads these at import time and
# JWT_SECRET_KEY has no default (RULES.md #4: no hardcoded secret, so it's
# required, and it must come from *somewhere* for tests to run at all).
# Tests get their own sqlite file, never the dev/prod database -- deleted
# up front so re-runs start from a clean schema instead of accumulating
# leftover users/productions across test sessions.
_TEST_DB_PATH = Path(__file__).parent / "test_app.db"
_TEST_DB_PATH.unlink(missing_ok=True)
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-do-not-use-in-prod")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TEST_DB_PATH}")


def make_click_track(bpm: float, duration_s: float = 8.0, sr: int = 22050) -> bytes:
    """
    Synthesizes a short percussive click track at an exact BPM, encoded as
    WAV bytes -- gives the real DSP pipeline genuine audio to analyze
    instead of relying on fabricated/hashed output.
    """
    beat_interval = 60.0 / bpm
    n_samples = int(duration_s * sr)
    y = np.zeros(n_samples, dtype=np.float32)

    click_len = int(0.015 * sr)
    t = np.arange(click_len) / sr
    click = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 90)

    beat_time = 0.0
    while beat_time < duration_s:
        start = int(beat_time * sr)
        end = min(start + click_len, n_samples)
        y[start:end] += click[: end - start]
        beat_time += beat_interval

    buffer = io.BytesIO()
    sf.write(buffer, y, sr, format="WAV")
    return buffer.getvalue()


@pytest.fixture
def click_track_120bpm() -> bytes:
    return make_click_track(bpm=120.0)


def make_tone(
    freq_hz: float = 220.0, duration_s: float = 3.0, sr: int = 22050, amplitude: float = 0.05
) -> bytes:
    """
    Synthesizes a continuous quiet sine tone, encoded as WAV bytes. Unlike
    the sparse click track (great for BPM detection, bad for loudness
    metrics since silence dominates its RMS), this gives loudness/mastering
    tests a signal where RMS-based measurements behave sensibly.
    """
    t = np.arange(int(duration_s * sr)) / sr
    y = (amplitude * np.sin(2 * np.pi * freq_hz * t)).astype(np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, y, sr, format="WAV")
    return buffer.getvalue()


@pytest.fixture
def quiet_tone_audio() -> bytes:
    return make_tone()
