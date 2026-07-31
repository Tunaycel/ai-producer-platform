"""Shared pytest fixtures for audio-related tests."""

import io

import numpy as np
import pytest
import soundfile as sf


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
