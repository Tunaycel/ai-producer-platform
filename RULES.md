# AI Producer Platform - Forbidden Engineering Rules

This document contains the rules that **must be followed without exception** for development, code quality, AI model output, security, and Git workflows on the **AI Producer Platform** project. All contributors and AI agents working on this project are required to follow these rules 100%.

---

## 🚫 1. Low-Quality or Generic AI Output Is Forbidden
* **No raw/unprocessed AI audio:** Raw audio files coming out of models (e.g. Suno, MusicGen) may never be served directly to the user.
* **DSP & mastering are mandatory:** Every generated beat and vocal must go through stem separation (Demucs/UVR), EQ, dynamic range compression, and spectral reference matching (Matchering/Pedalboard).
* **No generic prompt handling:** The AI may not collapse user requests into simplistic or unrelated generic music patterns. It must stay faithful to the BPM, key, scale, and drum-pattern parameters extracted from reference-track analysis.

## 🚫 2. Committing or Pushing Directly to `main` / `master` Is Forbidden
* **No direct commits:** The `main` branch is protected. No developer or AI agent may commit directly to `main`.
* **Branches are mandatory:** All new features (`feature/feature-name`), bug fixes (`fix/bug-name`), or documentation updates (`docs/doc-name`) must be made on a separate branch.

## 🚫 3. Merging Without a Green PR and CI/CD Check Is Forbidden
* **Green light required:** No Pull Request (PR) may be merged into `main` unless every GitHub Actions step (code audit, linter, security scan, unit tests) is **GREEN (PASS)**.
* **No manual bypassing:** Skipping/bypassing/force-merging past checks is strictly forbidden.

## 🚫 4. Hardcoded Secrets / API Keys Are Forbidden
* **No keys in code:** API keys, database passwords, or secret tokens may never be written into code files.
* **Environment variables are mandatory:** All sensitive information must be read from `.env` or GitHub Secrets / a cloud secret manager. `.env` must be in `.gitignore`.

## 🚫 5. Swallowing Errors, Deleting Tests, or Reducing Test Coverage Is Forbidden
* **No empty try/catch:** Errors may not be suppressed or swallowed (`catch (e) {}` or `except: pass` are forbidden).
* **No deleting tests:** Failing unit/integration tests may not be deleted or commented out. The root cause must be found and the code fixed.

## 🚫 6. Unauthorized Storage or Training on User Vocal Data Is Forbidden (GDPR-equivalent)
* **No unauthorized voice-data training:** Raw vocal data recorded by users may not be stored or shared with third parties to train general AI models without the user's explicit consent.
* **Encrypted storage:** Vocal recordings must only be processed for the duration of the session and kept encrypted in temporary storage.

## 🚫 7. Verbatim Copying of Copyrighted Audio/Beats Is Forbidden
* **No copyright infringement:** When analyzing viral songs in the "Put AI to Work / Viral Trend" tab, copyrighted audio waveforms may never be copied directly.
* **Parametric analysis only:** Only musical parameters (BPM, key, chord progression, drum groove, energy curve) may be analyzed, and original production must be suggested from scratch.

## 🚫 8. Spaghetti Code and Monolithic Design That Breaks Modularity Are Forbidden
* **No spaghetti code:** AI audio processing, web scraping, backend API, and frontend UI layers must be separated by clear boundaries.
* **Modular architecture:** The vocal processing service, beat generator, and viral analyzer must be designed as independent microservices/modules.
