# CLAUDE.md

This file defines how Claude Code operates in this repo. Source-of-truth documents for hard rules:
- [`RULES.md`](RULES.md) — 8 golden rules (quality, secrets, branch/PR flow, no swallowed errors, privacy, copyright, modularity). Followed **100%**, no exceptions.
- [`WORKFLOW_GUIDELINES.md`](WORKFLOW_GUIDELINES.md) — branch naming, commit format, PR and CI steps.

## Project

AI Producer Platform: a SaaS that lets artists with no DAW/mixing/autotune knowledge produce studio-quality tracks just by recording their vocal and talking to an AI producer. Three main modules: AI Producer Chat & Vocal Studio, Viral Trend Analyzer, DSP-based Mastering Engine (Demucs + Matchering + Pedalboard).

## Stack

- **Backend:** Python 3.11, FastAPI (`src/backend/`). Services under `src/backend/services/` are modular (audio_analyzer, producer_ai, viral_scanner) — each independent, not tightly coupled.
- **Frontend:** `frontend/` — React + Vite + TypeScript + Tailwind + shadcn/ui. English UI copy by default (`src/i18n/en.ts`); Turkish is a planned second locale, not the default. Visual identity must NOT default to the generic violet/cyan-on-black "AI SaaS" look — see ROADMAP.md for the current design direction.
- **Test/Lint:** `pytest` (`tests/`), `ruff` + `black` + `isort` + `mypy` (config in `pyproject.toml`), `bandit` + `pip-audit` for security.

## Mandatory workflow

1. **Never** commit/push directly to `main`. Every change on its own branch: `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `perf/*`, `ci/*` (naming: `WORKFLOW_GUIDELINES.md`).
2. Conventional Commits (`feat:`, `fix:`, `docs:`, ...).
3. Open a PR with `gh pr create`; never merge until **all** required GitHub Actions checks (test matrix, lint/type-check, bandit, pip-audit, secret scan, frontend integrity) are green.
4. No deleting or commenting out failing tests — find the root cause and fix the code.
5. No empty `except`/`catch` — errors are always logged or re-raised.
6. **No AI/Claude attribution of any kind in commits** — no `Co-Authored-By: Claude` or similar trailer, ever. Commits must read as authored solely by the repo owner. Verify `git config user.name`/`user.email` are set to the owner's identity before committing in any fresh clone or worktree.
7. Agents you delegate to (subagents, background agents) open PRs and stop — they never merge their own work or enable auto-merge on it. The orchestrating session always reviews and merges.

## Secrets

- No API key, DB password, or token is ever written into code. Local development uses `.env` (gitignored); CI/prod uses GitHub Actions Secrets.
- See [`.env.example`](.env.example) for which variables are needed — no real values, just names + descriptions.

## Agents

`.claude/agents/` holds 3 project-specific subagents (intentionally untracked — visible in the editor but never committed, so cloning the repo elsewhere won't show them; recreate as needed):
- **`code-reviewer`** — pre-PR code review, also checks against `RULES.md`.
- **`bug-hunter`** — root-cause analysis for audio pipeline / FastAPI endpoint bugs.
- **`frontend-developer`** — mandatory for any frontend work: must use the `ui-ux-pro-max` skill and 21st.dev MCP component/template tools, must never ship generic or half-finished UI, and must actively avoid the generic violet/cyan "AI product" look.

Proactively use the right agent for the job before falling back to a general-purpose one.

## Don't

- Push/commit directly to `main`
- Hardcode secrets in code
- Delete or bypass tests (`--no-verify` etc.)
- Serve raw/unprocessed AI audio output to the user (DSP is mandatory — see `RULES.md` #1)
- Store/train on user vocal data without consent (see `RULES.md` #6)
- Leave any AI/Claude co-author trailer in a commit message
