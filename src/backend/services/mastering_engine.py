"""
Mastering Engine Service
Applies a real DSP chain (EQ, compression, limiting) via Pedalboard so no
raw/unprocessed AI audio is ever returned to the user (RULES.md #1). This is
the first stage of the pipeline described in ROADMAP.md -- Demucs stem
separation and Matchering spectral reference matching are the next stages,
not yet integrated.
"""

import io
from typing import Any

import numpy as np
import soundfile as sf
from pedalboard import (
    Compressor,
    Gain,
    HighpassFilter,
    HighShelfFilter,
    Limiter,
    LowShelfFilter,
    PeakFilter,
    Pedalboard,
)

_LIMITER_CEILING_DBFS = -1.0  # true-peak safety margin below 0 dBFS
_MAX_MAKEUP_GAIN_DB = 12.0


class MasteringEngine:
    """Applies a mastering-grade DSP chain to raw audio via Pedalboard."""

    @staticmethod
    def master(
        sample_data: bytes | None, target_lufs: float = -9.0
    ) -> tuple[bytes, dict[str, Any]]:
        """
        Decodes `sample_data`, runs it through a real EQ/compression/limiting
        chain, and re-encodes it as WAV bytes.

        Raises ValueError if no audio data is provided or it can't be
        decoded -- we do not fabricate a "mastered" result from nothing.
        """
        if not sample_data:
            raise ValueError("master requires non-empty sample_data; cannot process without audio.")

        try:
            audio, sr = sf.read(io.BytesIO(sample_data), dtype="float32", always_2d=True)
        except Exception as exc:
            raise ValueError(f"Could not decode audio for mastering: {exc}") from exc

        if audio.size == 0:
            raise ValueError("Decoded audio is empty.")

        # soundfile gives (samples, channels); pedalboard wants (channels, samples).
        audio_cxs = audio.T

        before_dbfs = MasteringEngine._rms_dbfs(audio_cxs)
        makeup_gain_db = float(
            np.clip(target_lufs - before_dbfs, -_MAX_MAKEUP_GAIN_DB, _MAX_MAKEUP_GAIN_DB)
        )

        board = Pedalboard(
            [
                HighpassFilter(cutoff_frequency_hz=30),
                LowShelfFilter(cutoff_frequency_hz=120, gain_db=1.5, q=0.7),
                PeakFilter(cutoff_frequency_hz=2500, gain_db=1.0, q=1.0),
                HighShelfFilter(cutoff_frequency_hz=10000, gain_db=1.5, q=0.7),
                Compressor(threshold_db=-18.0, ratio=2.5, attack_ms=8.0, release_ms=180.0),
                Gain(gain_db=makeup_gain_db),
                Limiter(threshold_db=_LIMITER_CEILING_DBFS, release_ms=100.0),
            ]
        )

        processed = board(audio_cxs, sr)

        out_buffer = io.BytesIO()
        sf.write(out_buffer, processed.T, sr, format="WAV", subtype="PCM_24")

        return out_buffer.getvalue(), {
            "sample_rate": sr,
            "target_lufs": target_lufs,
            "loudness_before_dbfs": before_dbfs,
            "loudness_after_dbfs": MasteringEngine._rms_dbfs(processed),
            "chain": [
                "Highpass filter (rumble removal, 30Hz)",
                "Low-shelf warmth (120Hz)",
                "Presence peak (2.5kHz)",
                "High-shelf air (10kHz)",
                "Compressor (2.5:1 ratio, -18dB threshold)",
                "Makeup gain",
                f"Limiter (ceiling {_LIMITER_CEILING_DBFS} dBFS)",
            ],
        }

    @staticmethod
    def _rms_dbfs(audio_cxs: np.ndarray) -> float:
        rms = float(np.sqrt(np.mean(np.square(audio_cxs))) + 1e-9)
        return round(float(20 * np.log10(rms)), 1)
