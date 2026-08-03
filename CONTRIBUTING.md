# Contributing

How to work in this repo.

## Before you start

1. Check existing **Issues** — someone may have already opened the same one.
2. For large changes, open an **Issue** first and discuss it.
3. **Fork** the repo and work from your own branch.

## Branches

```
feature/  → New features
fix/      → Bug fixes
docs/     → Documentation updates
refactor/ → Code refactoring
perf/     → Performance improvements
ci/       → CI/CD changes
```

## Commit messages (Conventional Commits)

```
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:    Code style (whitespace, formatting, missing semicolons, etc.)
refactor: A change that is neither a bug fix nor a feature
perf:     Performance improvement
test:     Adding missing tests or correcting existing tests
chore:    Changes to the build process or auxiliary tools
```

## Pull requests

1. Create a branch from an up-to-date `main`.
2. Make your changes.
3. Make sure all tests pass: `pytest tests/ -v`
4. Open a PR — fill out the PR template completely.
5. Wait until all CI/CD checks are green.
6. Squash-merge into `main`.

## Running tests

```bash
# All tests
pytest tests/ -v

# With a coverage report
pytest tests/ --cov=src --cov-report=term-missing

# A single file
pytest tests/test_audio_engine.py -v
```

## Installing dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # dev tools
```

## Questions

Open an issue.
