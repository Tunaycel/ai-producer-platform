# AI Producer Platform - Git & GitHub Actions Workflow Guidelines

This document defines the standards for code development, branch management, Pull Request (PR) processes, and continuous integration/code audit via GitHub Actions on this project.

---

## 📌 1. Branch Naming Standards

The `main` branch is closed to direct development. A new branch following the standards below must be created for every change:

* **New features:** `feature/feature-name` (e.g. `feature/vocal-autotune-pipeline`, `feature/viral-trend-scraper`)
* **Bug fixes:** `fix/bug-name` (e.g. `fix/audio-stem-sync-delay`, `fix/beat-bpm-detection`)
* **Documentation:** `docs/doc-name` (e.g. `docs/api-specifications`)
* **Refactor & performance:** `refactor/component-name` or `perf/audio-processing`
* **CI/CD workflows:** `ci/workflow-name`

---

## 🔄 2. Step-by-Step Development Workflow

1. **Create a branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature-name
   ```

2. **Make changes and commit:**
   Commit messages must be clear and follow Conventional Commits:
   * `feat: add spectral matching mastering engine`
   * `fix: correct stem separation offset calculation`
   * `docs: update forbidden rules list`

3. **Push the branch:**
   ```bash
   git push origin feature/new-feature-name
   ```

4. **Open a Pull Request (PR):**
   * Open a PR targeting `main` on GitHub.
   * Describe the changes made, test results, and checked-off items in the PR template.

5. **Automatic GitHub Actions checks:**
   * The moment a PR is opened, the GitHub Actions workflow (`code-audit.yml`) is triggered.
   * Linter (Ruff), type checker (mypy), security audit, and unit tests all run.

6. **Merge condition:**
   * A PR may not be merged into `main` until every GitHub Actions step is **GREEN (PASS)** and the code review is approved!

---

## ⚙️ 3. Continuous Code Audit Pipeline

Checks that run on GitHub Actions:

1. **Static code analysis & linting:** Compliance with code standards and clean-code rules.
2. **Security & dependency audit:** Detects API key leaks and packages with known vulnerabilities.
3. **Audio processing unit tests:** Correctness of audio processing modules (BPM calculation, frequency ranges, format conversions).
4. **Forbidden Rules compliance check:** Verifies compliance with the rules in `RULES.md`.
