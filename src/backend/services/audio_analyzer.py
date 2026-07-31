"""
Audio Analyzer Service
Performs real signal analysis (BPM, musical key, loudness, spectral balance)
on uploaded reference audio via librosa. No filename hashing, no fabricated
output -- RULES.md #1 requires DSP-backed results, not generic AI noise.
"""

import io
from typing import Any

import librosa
import numpy as np

# Krumhansl-Schmuckler key-profile weights: correlated against a track's
# pitch-class energy distribution to find the best-matching major/minor key.
_MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

# Camelot wheel: pitch class (C=0 .. B=11) -> the notation producers/DJs
# actually use for harmonic mixing.
_MAJOR_CAMELOT = {
    0: "8B (C)",
    7: "9B (G)",
    2: "10B (D)",
    9: "11B (A)",
    4: "12B (E)",
    11: "1B (B)",
    6: "2B (F#)",
    1: "3B (Db)",
    8: "4B (Ab)",
    3: "5B (Eb)",
    10: "6B (Bb)",
    5: "7B (F)",
}
_MINOR_CAMELOT = {
    8: "1A (Abm)",
    3: "2A (Ebm)",
    10: "3A (Bbm)",
    5: "4A (Fm)",
    0: "5A (Cm)",
    7: "6A (Gm)",
    2: "7A (Dm)",
    9: "8A (Am)",
    4: "9A (Em)",
    11: "10A (Bm)",
    6: "11A (F#m)",
    1: "12A (C#m)",
}

_SUB_BASS_RANGE = (30.0, 80.0)
_MID_RANGE = (1000.0, 3000.0)
_HIGH_RANGE = (10000.0, 18000.0)


class AudioAnalyzer:
    """Analyzes real audio signals to extract musical metadata for the producer pipeline."""

    @staticmethod
    def detect_bpm_and_key(filename: str = "", sample_data: bytes | None = None) -> dict[str, Any]:
        """
        Decodes `sample_data` and extracts BPM, musical key/scale, loudness,
        and spectral balance via actual signal processing.

        Raises ValueError if no audio data is provided or it can't be
        decoded -- we do not fabricate a result when there is no audio.
        """
        if not sample_data:
            raise ValueError(
                "detect_bpm_and_key requires non-empty sample_data; cannot analyze without audio."
            )

        try:
            y, sr = librosa.load(io.BytesIO(sample_data), sr=None, mono=True)
        except Exception as exc:
            raise ValueError(f"Could not decode audio for '{filename or 'upload'}': {exc}") from exc

        if y.size == 0:
            raise ValueError(f"Decoded audio for '{filename or 'upload'}' is empty.")

        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = round(float(np.asarray(tempo).reshape(-1)[0]), 1)

        key_name, scale = AudioAnalyzer._detect_key(y, sr)

        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(np.mean(rms))
        # RMS-based loudness estimate in dBFS -- a practical proxy, not a
        # full ITU-R BS.1770 LUFS implementation.
        loudness_dbfs = round(float(20 * np.log10(mean_rms + 1e-9)), 1)
        energy_rating = round(float(np.clip(mean_rms * 8.0, 0.0, 1.0)), 2)

        return {
            "bpm": bpm,
            "key": key_name,
            "scale": scale,
            "energy_rating": energy_rating,
            "drum_groove": (
                "808 Heavy / Half-time Bounce" if bpm > 135 else "Boom Bap / Straight 16th"
            ),
            "dynamic_range_lufs": loudness_dbfs,
            "spectral_balance": AudioAnalyzer._spectral_balance(y, sr),
        }

    @staticmethod
    def _detect_key(y: np.ndarray, sr: float) -> tuple[str, str]:
        """Krumhansl-Schmuckler key estimation from chroma energy."""
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        pitch_class_energy = chroma.mean(axis=1)

        best_score = -np.inf
        best_pc = 0
        best_is_major = True
        for pc in range(12):
            rotated = np.roll(pitch_class_energy, -pc)
            major_corr = np.corrcoef(rotated, _MAJOR_PROFILE)[0, 1]
            minor_corr = np.corrcoef(rotated, _MINOR_PROFILE)[0, 1]
            if major_corr > best_score:
                best_score, best_pc, best_is_major = major_corr, pc, True
            if minor_corr > best_score:
                best_score, best_pc, best_is_major = minor_corr, pc, False

        if best_is_major:
            return _MAJOR_CAMELOT[best_pc], "Major"
        return _MINOR_CAMELOT[best_pc], "Minor"

    @staticmethod
    def _spectral_balance(y: np.ndarray, sr: float) -> dict[str, str]:
        """Real per-band energy share (sub-bass / mids / highs) via STFT."""
        stft = np.abs(librosa.stft(y))
        freqs = librosa.fft_frequencies(sr=sr)

        def band_energy(lo: float, hi: float) -> float:
            mask = (freqs >= lo) & (freqs <= hi)
            if not mask.any():
                return 0.0
            return float(stft[mask, :].mean())

        sub_bass = band_energy(*_SUB_BASS_RANGE)
        mids = band_energy(*_MID_RANGE)
        highs = band_energy(*_HIGH_RANGE)
        total = sub_bass + mids + highs + 1e-9

        return {
            "sub_bass": f"{sub_bass / total:.0%} (30Hz-80Hz)",
            "mids": f"{mids / total:.0%} (1kHz-3kHz)",
            "highs": f"{highs / total:.0%} (10kHz-18kHz)",
        }

    @staticmethod
    def compare_reference_with_vocal(
        reference_meta: dict[str, Any], vocal_bpm: float
    ) -> dict[str, Any]:
        """Calculates pitch shift & stretch ratio needed to lock vocal into reference beat."""
        target_bpm = reference_meta.get("bpm", 140)
        vocal_bpm = vocal_bpm or target_bpm
        time_stretch_factor = round(target_bpm / vocal_bpm, 3)

        return {
            "target_bpm": target_bpm,
            "vocal_bpm": vocal_bpm,
            "time_stretch_ratio": time_stretch_factor,
            "recommended_pitch_shift_semitones": 0,
            "key_lock": reference_meta.get("key", "8A (Am)"),
            "autotune_scale_matching": "Locked to " + reference_meta.get("key", "Am"),
        }
