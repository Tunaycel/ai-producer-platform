"""
Producer AI Service
Implements intelligent music producer dialogue, subgenre beat parameters mapping, and mix guidance.
"""

from typing import Any


class ProducerAIService:
    """Simulates top-tier executive music producer logic and natural language beat design."""

    GENRE_PRESETS = {
        "rage": {
            "bpm": 150,
            "key": "C# Minor",
            "vibe": "Aggressive Synth Lead, Distorted 808, Fast Hi-Hats",
            "vocal_chain": "Travis Scott AutoTune (Fast Speed, 0ms retune), Heavy Reverb 2.4s, Stereo Delay",
        },
        "dark trap": {
            "bpm": 140,
            "key": "A Minor",
            "vibe": "Minor Bell Melody, Deep Sub 808, Triplet Snares",
            "vocal_chain": "Natural Hard Tune, High-pass filter @ 120Hz, Dynamic Compression 4:1",
        },
        "melodic drill": {
            "bpm": 142,
            "key": "E Minor",
            "vibe": "Sliding 808 Basslines, Vocal Sample Chop, Stutter Snares",
            "vocal_chain": "Pitch Formant Shifter (-2 semitones blend), Plate Reverb, Parallel Compression",
        },
        "boom bap": {
            "bpm": 92,
            "key": "F Minor",
            "vibe": "Vinyl Crackle, Dusty Jazz Piano Chords, Heavy Punchy Kick & Snare",
            "vocal_chain": "Warm Analog Tape Saturation, Soft Retune Speed (25ms), De-esser",
        },
    }

    @staticmethod
    def process_artist_request(
        prompt: str, vocal_present: bool = False, reference_audio_meta: dict[str, Any] = None
    ) -> dict[str, Any]:
        """
        Processes natural language instructions from the artist and generates production instructions.
        """
        prompt_lower = prompt.lower()
        selected_genre = "dark trap"

        for genre in ProducerAIService.GENRE_PRESETS:
            if genre in prompt_lower:
                selected_genre = genre
                break

        preset = ProducerAIService.GENRE_PRESETS[selected_genre]
        bpm = reference_audio_meta.get("bpm") if reference_audio_meta else preset["bpm"]
        key = reference_audio_meta.get("key") if reference_audio_meta else preset["key"]

        producer_reply = (
            f"Got it! I'm building your sound around a **{selected_genre.upper()}** foundation. "
            f"Locking BPM at **{bpm}** and the key at **{key}**. "
            f"{'Vocal detected — prepping the autotune and spectral mix chain.' if vocal_present else 'No vocal recorded yet — record from your mic or upload a vocal file whenever you are ready.'} "
            f"Beat character: {preset['vibe']}."
        )

        return {
            "producer_message": producer_reply,
            "genre": selected_genre,
            "beat_parameters": {
                "bpm": bpm,
                "key": key,
                "sub_bass_type": (
                    "Distorted 808"
                    if "rage" in selected_genre or "drill" in selected_genre
                    else "Deep Sub"
                ),
                "hihat_groove": "Triplet Rolls",
                "instrumentation": preset["vibe"],
            },
            "recommended_vocal_chain": preset["vocal_chain"],
            "mastering_target": "-9.0 LUFS (Club/Streaming Ready)",
        }
