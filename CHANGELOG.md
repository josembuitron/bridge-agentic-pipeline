# Changelog

All notable changes to the BRIDGE Agentic Pipeline are documented in this file.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-05-25

This release tightens the pipeline's polish without touching its differential value (end-to-end requirements-to-delivery, phase gates with human approval, per-client knowledge graph, dual-output deliverable generation, 24 development methodologies with CT-driven selection, 32 Trail of Bits security skills assigned per phase). What lands here: prompt-injection defense on every spawned agent, numeric rubric scoring at every critical-review gate, a structured pre-translation discovery interview, a small CLI surface, a test scaffold, modular documentation, and funding configuration.

### Added

- **Prompt Defense Baseline** (`skills/bridge/references/prompt-defense-baseline.md`) -- parameterized self-defense block prepended to every Agent tool call. Protects against prompt injection, homoglyphs, zero-width characters, and embedded instructions in transcripts, fetched URLs, retrieved documents, and code comments. Referenced from `orchestrator/core.md` and `orchestrator/modules/pixel-agent.md`.
- **Rubric Scoring** (`skills/bridge/references/rubric-scoring.md`) -- per-phase weighted rubrics (Phase 1, 2, 3, 5) with 1-10 calibrated scoring, weighted totals, and PASS/BLOCK thresholds. Ojo Critico now produces both the qualitative findings table and a numeric score block. A `pipeline/ojo-critico-scores.jsonl` append-only log records every review for cross-project drift analysis.
- **Discovery Interview module** (`skills/bridge/orchestrator/modules/discovery-interview.md`) -- structured pre-translator interview covering project identity, business outcome, technical stack, quality posture, delivery constraints, and branding. Always active in Phase 0.5, with an explicit "skip" option presented in the first prompt so existing users are never trapped into the flow.
- **CLI skeleton** (`scripts/bridge.js` plus `scripts/lib/`) -- `node scripts/bridge.js doctor` checks Node.js, Python, and the BRIDGE CLI tool chain; `node scripts/bridge.js status` reports on local projects. Wired into `package.json` as the `bridge` bin.
- **Test scaffold** (`tests/`) -- two structural tests (required files present, module references resolve) plus two fixture inputs (a transcript and an email) ready for future end-to-end tests. Runnable via `npm test`.
- **Modular documentation** (`docs/ARCHITECTURE.md`, `docs/REFERENCE.md`, `docs/COMMANDS.md`) -- the long-form architecture, tool stack, and command reference move out of README into dedicated documents. README now reads as a project landing page that links into the depth on demand.
- **Funding configuration** (`.github/FUNDING.yml`) -- enables the Sponsor button on the repo header.
- **CHANGELOG.md** and **VERSION** -- semantic versioning anchored at 2.0.0 for this hardening pass.

### Changed

- `orchestrator/core.md` references the new Prompt Defense Baseline as the FIRST block injected into every agent prompt, and lists the two new reference files alongside the existing ones.
- `orchestrator/modules/pixel-agent.md` documents the injection protocol that resolves the display name from the Pixel table into the `{AGENT_ROLE}` placeholder of the baseline.
- `references/ojo-critico.md` output format now emits a numeric Rubric Scores block before the findings table and appends one JSON line per review to `pipeline/ojo-critico-scores.jsonl`. The CRITICAL/WARNING/NOTE conventions are preserved verbatim.
- `phases/00-initialization.md` Phase 0.5 wires in the Discovery Interview module. Discovery is presented every run, with skip available at the opening prompt and per-category.
- `README.md` slims to ~400 lines, surfacing the new modular `docs/` layout.

### Removed

Nothing was removed. All prior behavior remains available; new behavior is additive and opt-in where it could surprise an existing user.

### Migration

Existing projects under `clients/{client}/{project}/` continue to work without modification. A new `pipeline/ojo-critico-scores.jsonl` will start appearing in new reviews; old reviews remain untouched. If you have local edits to `core.md`, `pixel-agent.md`, `ojo-critico.md`, or `00-initialization.md`, replay your edits on top of the new versions -- the additions are well-marked sections and easy to merge.
