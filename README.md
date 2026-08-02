# AI Producer Platform

Vocal-first music production for artists who don't run a DAW: record a vocal, describe what
you want in plain language, and get back an analysed reference, a proposed vocal chain, and a
mastered mix.

**Status: working prototype.** The analysis and mastering paths are real DSP, not mock data.
The vocal-transformation path (stem separation, pitch correction, reference matching) is
specified but not yet wired up — see [Limitations](#limitations) for exactly where the line
is. Nothing outside that section is aspirational.

---

## What actually runs today

### Reference analysis — `POST /api/v1/audio/analyze-reference`

Extracts musical parameters from an uploaded track using [librosa](https://librosa.org/):

| Parameter | Method |
|---|---|
| Tempo (BPM) | Onset-strength beat tracking |
| Key & scale | Krumhansl–Schmuckler chroma-profile correlation |
| Spectral balance | STFT band energy (low / low-mid / high-mid / high) |

An earlier build derived these values from a hash of the filename. That placeholder was
replaced with the real signal path in `a59d392`; the analyser now fails loudly on unreadable
audio instead of returning a plausible-looking number.

### Mastering chain — `POST /api/v1/audio/master`

A fixed-order effects chain built on [Pedalboard](https://spotify.github.io/pedalboard/),
Spotify's C++ audio-effects library:

```
highpass → low shelf → presence peak → compressor → makeup gain → limiter
```

Operates on the full mix. Per-stem processing needs Demucs, which is not integrated yet.

### Producer chat — `POST /api/v1/producer/chat`

Maps a natural-language request onto concrete production parameters (BPM, key, drum pattern,
vocal-chain preset) drawn from a shared `GENRE_PRESETS` table, so the chat cannot propose
settings the engine is unable to apply.

### Viral trend analyser — `GET /api/v1/trends/viral-beats`

Surfaces trending beat characteristics and matches them against the analysed vocal.

---

## Architecture

```
src/backend/                    FastAPI · 5 endpoints · ~800 LOC
  services/audio_analyzer.py      librosa — BPM, key, spectral balance
  services/mastering_engine.py    Pedalboard — EQ → comp → limiter
  services/producer_ai.py         NL request → production parameters
  services/viral_scanner.py       Trend data → vocal matching
frontend/src/                   React 19 + Vite + TypeScript · ~4,700 LOC
  components/studio/              Recorder, VU meter, rotary knobs, mastering console
  components/producer/            Chat panel
  components/landing/             WebGL hero (@react-three/fiber)
tests/                          21 pytest cases — API contract + DSP behaviour
```

Backend services are independent modules with no cross-imports, so the DSP chain can be
exercised without the API layer and vice versa.

The console UI (VU meters, rotary knobs) is hand-built with CSS transforms and pointer
physics rather than pulled from a component library — the knobs need continuous drag with a
configurable taper, which off-the-shelf sliders don't give you.

---

## Running it

```bash
pip install -r requirements.txt
uvicorn src.backend.main:app --reload       # http://localhost:8000

cd frontend && npm install && npm run dev   # http://localhost:5173
```

Tests and checks:

```bash
pytest tests/ -v
pytest tests/ --cov=src --cov-report=term-missing
ruff check . && black --check . && mypy src/
```

CI runs the suite on Python 3.10 / 3.11 / 3.12 plus ruff, black, isort, mypy, Bandit (SAST),
pip-audit (dependency CVEs), and secret scanning. `main` is protected — no direct pushes, and
every check has to pass before a merge.

---

## Limitations

Being explicit, because the gap between these two lists is the honest state of the project.

**Real:**

- BPM / key / spectral analysis (librosa)
- Full-mix mastering chain (Pedalboard)
- Browser vocal capture and waveform rendering
- Genre preset → production-parameter mapping

**Not yet integrated:**

- **Demucs** stem separation, and therefore per-stem mastering
- **Matchering** spectral reference matching
- **RVC / pitch correction** — the vocal-chain knobs move preset values but are not bound to
  a live audio engine
- No persistence, no auth, no billing. The pricing UI is a design placeholder and charges
  nothing.

[ROADMAP.md](ROADMAP.md) has the sequenced backlog and the reasoning behind the next DSP
choices (hybrid F0 detection, BS-RoFormer separation, platform-aware LUFS targets).

---

## Contributing

Branch naming, commit format, and the PR process: [CONTRIBUTING.md](CONTRIBUTING.md).
Security reports: [SECURITY.md](SECURITY.md).
