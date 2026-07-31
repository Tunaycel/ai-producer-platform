# Roadmap

Working backlog for AI Producer Platform, sequenced by dependency order. Each item ships as its own branch → PR → green CI → merge (see [WORKFLOW_GUIDELINES.md](WORKFLOW_GUIDELINES.md)).

## In progress

- [ ] **Frontend rebuild** — migrate `src/frontend/` (vanilla HTML/CSS/JS) to React + Vite + TypeScript + Tailwind + shadcn/ui, built with the `frontend-developer` agent (`ui-ux-pro-max` skill + 21st.dev component sourcing). UI copy in English by default, i18n-ready structure so Turkish can be added as a locale later.
- [ ] **Competitive tech research** — survey what AI/audio stack leading players (US, China, EU) use in AI music production, to find concrete technical differentiators for our DSP/mastering pipeline.

## Next up

1. **Vocal capture + analysis polish** — harden `audio_analyzer.py` (BPM/key detection accuracy, sample-rate handling, error paths), backed by real test coverage in `tests/test_audio_engine.py`.
2. **Mastering / DSP pipeline** — wire `producer_ai.py`'s beat-parameter output into an actual DSP chain: Demucs (stem separation) → EQ/compression (Pedalboard) → spectral reference matching (Matchering). Replace the current rule-based genre presets with real signal processing. Target: consistent -9.0 LUFS streaming-ready output, no raw/unprocessed AI audio reaches the user (yasaklar_listesi.md rule 1).
3. **Vocal chain (autotune/pitch correction)** — integrate RVC or Kits.ai for the "recommended_vocal_chain" the producer service already proposes but doesn't yet execute.
4. **Viral Trend Scanner** — replace the hardcoded `viral_scanner.py` recommendations with real trend ingestion (TikTok / Spotify Viral 50 / YouTube), respecting rule 7 (parametric analysis only, no waveform copying).
5. **i18n** — add Turkish as a second UI locale once the English-first React frontend is stable.
6. **Auth + subscription tiers** — the pricing table in the UI is currently static; needs real user accounts and billing (Stripe) to back Starter/Pro Artist/Studio Unlimited.

## Explicitly deferred (not blocking, revisit later)

- LICENSE file (commercial SaaS — revisit if/when open-sourcing any component)
- Multi-region deployment / scaling — premature before the core pipeline is real

## How this list gets maintained

Updated after each merged milestone with a short "what we used and why" note (per the project's reporting convention) so technology choices stay traceable.
