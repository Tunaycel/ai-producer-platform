# Roadmap

Working backlog for AI Producer Platform, sequenced by dependency order. Each item ships as its own branch → PR → green CI → merge (see [WORKFLOW_GUIDELINES.md](WORKFLOW_GUIDELINES.md)).

## In progress

- [ ] **Frontend rebuild** — migrate `src/frontend/` (vanilla HTML/CSS/JS) to React + Vite + TypeScript + Tailwind + shadcn/ui, built with the `frontend-developer` agent (`ui-ux-pro-max` skill + 21st.dev component sourcing). UI copy in English by default, i18n-ready structure so Turkish can be added as a locale later.

## Technical differentiators (from competitive research, 2026-07-31)

Surveyed what Suno, Udio, Kits.ai, LANDR, BandLab SongStarter, and ByteDance/NetEase/Tencent's AI music tools are known or reported to use, to find concrete (non-hype) upgrades to our Demucs + Matchering + Pedalboard + RVC/Kits.ai pipeline. Full findings with sources: see the research summary in PR history; caveat — Suno/Udio architecture claims are third-party/unverified, treat as directional not authoritative.

Ranked by expected impact:

1. **Hybrid F0 (pitch) detection** for the vocal chain — combine Crepe + RMVPE + Mangio-Crepe instead of a single default pitch tracker (this is what Kits.ai credits for cleaner note transitions vs stock RVC).
2. **BS-RoFormer for stem separation**, alone or ensembled with Demucs — won SDX23 (12.9 dB SDR), stronger vocal/bass isolation directly improves what feeds into vocal processing.
3. **Diff-MST-style differentiable mixing** to complement Matchering — Matchering only does single-file spectral matching; a multitrack-aware, trainable EQ/compression/pan predictor is a real technical gap Matchering can't fill.
4. **Platform-aware loudness targets** (Spotify -14 LUFS, Apple Music -16, YouTube/Tidal asymmetric) instead of one fixed mastering target — cheap to implement, most amateur/AI mastering tools still don't do this.
5. **Replace the mocked prompt→preset rules in `producer_ai.py` with real LLM-based prompt interpretation** — ByteDance's Seed-Music uses multimodal (text/audio/score) conditioning; a static lookup table can't handle ambiguous or creative prompts the way this roadmap's vocal studio needs to.
6. **Adaptive retrieval ratio** in voice conversion (vs. RVC's fixed ratio) — reduces artifacts, another Kits.ai-credited improvement.
7. **Stem-level export/editing as a product feature**, not just a black-box single file — Suno Studio (Sept 2025) added exactly this; keeps semi-pro users from churning to a real DAW.
8. **"Fairly Trained" style consent certification** for whatever vocal-conversion training data we end up using — not technical, but affects label/B2B trust (Kits.ai, Boomy, Endel already hold this).

## Next up

1. **Vocal capture + analysis polish** — harden `audio_analyzer.py` (BPM/key detection accuracy, sample-rate handling, error paths), backed by real test coverage in `tests/test_audio_engine.py`.
2. **Mastering / DSP pipeline** — wire `producer_ai.py`'s beat-parameter output into an actual DSP chain: Demucs (stem separation, consider BS-RoFormer ensemble per differentiator #2) → EQ/compression (Pedalboard) → spectral reference matching (Matchering, consider Diff-MST-style multitrack mixing per differentiator #3). Replace the current rule-based genre presets with real signal processing. Target: platform-aware loudness (differentiator #4), no raw/unprocessed AI audio reaches the user (yasaklar_listesi.md rule 1).
3. **Vocal chain (autotune/pitch correction)** — integrate RVC or Kits.ai for the "recommended_vocal_chain" the producer service already proposes but doesn't yet execute; prioritize hybrid F0 detection and adaptive retrieval ratio (differentiators #1, #6).
4. **Viral Trend Scanner** — replace the hardcoded `viral_scanner.py` recommendations with real trend ingestion (TikTok / Spotify Viral 50 / YouTube), respecting rule 7 (parametric analysis only, no waveform copying).
5. **i18n** — add Turkish as a second UI locale once the English-first React frontend is stable.
6. **Auth + subscription tiers** — the pricing table in the UI is currently static; needs real user accounts and billing (Stripe) to back Starter/Pro Artist/Studio Unlimited.

## Explicitly deferred (not blocking, revisit later)

- LICENSE file (commercial SaaS — revisit if/when open-sourcing any component)
- Multi-region deployment / scaling — premature before the core pipeline is real

## How this list gets maintained

Updated after each merged milestone with a short "what we used and why" note (per the project's reporting convention) so technology choices stay traceable.
