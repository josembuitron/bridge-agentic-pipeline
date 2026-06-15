# Changelog

All notable changes to the BRIDGE Agentic Pipeline are documented in this file.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-06-15

Closes the main passive bypass left in v2.2.0: the per-slice review gate trusted the architect's risk label, so a high-risk slice mislabeled "standard" escaped review. The enforcement hook now computes risk from the slice's actual files, and the label can only escalate risk, never lower it.

### Added

- **Content-based risk classifier** in `verify-slice-reviews.js`. The hook matches each slice's `files` (now recorded in the ledger from the Slice Contract) against high-risk path patterns: migrations, schema, `.sql`, auth/session/jwt, secrets/crypto, money/billing, IaC (Terraform/Bicep/Dockerfile/Kubernetes/Helm), CI/CD (`.github/workflows` and `azure-pipelines`), and ETL/transform. Any match forces review regardless of the label.
- **`files` field in the slice ledger** (`04-build.md` Step 4.3.0), populated from the Slice Contract's "Files Expected" (Create + Modify).
- Four unit cases (24 total) covering content override, the verified-low-risk exemption, the "standard but no files" can-not-verify block, and Azure DevOps/Bicep paths.

### Changed

- **Risk is computed, not just trusted.** A slice is exempt from review ONLY when it is explicitly `"standard"`, lists its files, AND none touch a high-risk surface. A `"standard"` slice with no files recorded still requires review (low risk cannot be verified). This makes the architect's label able to escalate risk but never silently lower it, closing the "mislabel high as standard" passive bypass. (`modules/per-slice-review-hook.md`, `04-build.md`.)

### Notes

- The residual is now narrow and active-only: a high-risk slice whose file paths match no pattern AND that is labeled `standard` could still escape. The pattern list is tunable per stack. Truly defeating deliberate deception requires out-of-process enforcement (a CI check on the PR, GitHub Actions or Azure DevOps Pipelines, that the orchestrator cannot write to); the local hook raises the cost and preserves an audit trail.

## [2.2.0] - 2026-06-15

Turns the per-slice independent review from an instruction the orchestrator could skip into a deterministic guarantee a shell-level hook enforces, and makes the default model profile degrade nothing. v2.1.0 added the per-slice review as prose; this release makes it real: a Stop hook blocks the pipeline from ending if a high-risk slice is complete without a valid review by a different agent. The enforcement script was itself put through two independent reviews (the discipline it enforces) and a 20-case test suite; the second review caught a fail-open bug that was fixed before release.

### Added

- **Per-slice review enforcement hook** (`skills/bridge/orchestrator/scripts/verify-slice-reviews.js` + `modules/per-slice-review-hook.md`). A deterministic Stop hook, installed by default (Phase 0 Step 0.4d) whenever `workflow.per_slice_review != "off"` and BLOCKING by default. It reads a structured slice ledger and the build manifest and exits 2 (blocks the stop) when a slice that requires review is complete without a valid independent review: no review, reviewer equal to builder (case-insensitive), a non-pass verdict, or a missing/hollow artifact whose `Reviewer-Agent`/`Verdict` do not match the ledger. Cross-checks `BRIDGE_SLICE_COMPLETE` manifest tokens so a slice cannot be hidden from the ledger.
- **Slice ledger contract** (`04-build.md` Step 4.3.0) -- `pipeline/04-slice-ledger.json`, the machine-readable record the hook enforces against, written as each slice contract is created.
- **Review artifact contract** (`04-build.md` Step 4.3.5) -- every high-risk slice writes `pipeline/04-<slice>-review.md` with parseable `Builder-Agent`/`Reviewer-Agent`/`Verdict` headers.
- **Unit test** (`tests/unit/test-verify-slice-reviews.js`, 20 cases) wired into `npm test`: covers blocking on unreviewed/self-reviewed/hollow-artifact/missing-risk/dodge cases, allowing on valid review/standard/warn/loop-guard, BOM-encoded ledgers, and the non-string-field fail-open regression.

### Changed

- **Default model profile now degrades nothing.** The default profile is `quality`, and in it every role (architect, validator, reviewers, builders, cleanup) is `inherit` -- it rides the session model, the strongest the user has. Cost-tiering (Opus/Sonnet/Haiku) is confined to the opt-in `balanced` and `budget` profiles, where a Sonnet floor still applies to anything that writes or judges code. (`model-routing.md`, `00-initialization.md`.)
- **Corrected hook exit-code semantics across the docs:** in Claude Code, exit 2 BLOCKS a Stop/PreToolUse hook (stderr fed back to the model) and exit 0 allows. Earlier docs claimed the reverse (exit 1 to block), which does not block -- meaning prior "enforce mode" hooks likely never actually blocked. (`00-initialization.md` Step 0.4c note.)
- `04-build.md` Step 4.4 checkpoint verifies the ledger/review records; `core.md` lists the new module.

### Fixed

- **Fail-open bypass in the enforcement script** (caught by the second independent review before release): a non-string field such as a numeric `reviewer_agent` threw, was caught by the top-level handler, and exited 0 -- silently bypassing the gate. Field reads are now `String()`-coerced, each slice is evaluated in its own try/catch so a malformed entry fails CLOSED, and `risk` opts a slice out of review only when it is exactly the string `"standard"` (arrays/numbers/missing now fail safe to "needs review").

## [2.1.0] - 2026-06-12

Verification moves from a single end-of-pipeline event to continuous, per-slice enforced gates. Driven by field evidence from a full production run: an independent per-slice review caught a SQL Server `IDENTITY` dialect bug and a silent data-loss path that the build's own green tests were structurally blind to (the suite ran on SQLite; production was SQL Server). The operator had to hand-layer that review; this release bakes it in. It also overhauls model routing after the pinned model IDs in 2.0.0 rotted.

### Added

- **Per-slice independent review gate** (`phases/04-build.md` Step 4.3.5; `workflow.per_slice_review`: `risk-gated` | `all` | `off`, default `risk-gated`) -- after a specialist's own SELF-VERIFY, two FRESH reviewers that did not write the code run in sequence: a spec-compliance reviewer (re-runs the suite, checks each Slice Contract criterion TRUE/FALSE against observed behavior) and a code-quality reviewer (reviews the git diff per `references/ojo-critico.md` and must execute the code, not just read it). The builder grading its own homework no longer closes a slice.
- **Real-data verification step** (`phases/04-build.md` Step 4.3.6; `workflow.real_data_verification`, default `true`) -- data-touching slices must dry-run against a sample of the REAL input (not only fixtures), recording in/out counts, integrity errors, and an idempotency re-run. If no real sample exists, the slice is loudly recorded `UNVERIFIED-ON-REAL-DATA` -- never silently fixtures-only.
- **Gate Degradation Protocol** (`phases/04-build.md`) -- any per-slice gate that depends on an external tool (semgrep, eslint, test runner, Playwright) fails LOUDLY when the tool is missing: `DEGRADED` status in the build manifest and `security-events.json`, an install offer, explicit user acknowledgment to continue, a visible banner at every later approval gate, and a mandatory re-run in Phase 5 before the blocking security gate.
- **Test/prod engine parity check** (`modules/structural-linter.md` Check 6) -- flags test suites running on a different engine than production (SQLite vs SQL Server class of failure). WARN by default; ERROR on high-risk slices unless a dialect spot-check or real-engine dry run is included. A green suite on the wrong engine manufactures false confidence.
- **Per-slice risk flags** (`phases/03-architect.md`) -- the Architect marks each vertical slice `Risk: high | standard` (DB schema/migrations, auth, money movement, real-client-data transformation, irreversible ops are high). The flag drives the risk-gated review so trivial slices skip the extra cost.
- **Root-cause-before-retry rule** (`phases/04-build.md`) -- when a review or verification finding contradicts a passing test, a `systematic-debugging` root-cause writeup is required BEFORE the first fix attempt. A wrong-but-green slice never stalls, so the stall detector cannot see it; the contradiction itself is the trigger.
- **Skills as live gates** (`phases/04-build.md`) -- sub-agents cannot invoke skills, so methodology embedded as prompt prose decays under token pressure. The orchestrator now runs `verification-before-completion` and `requesting-code-review` itself, as gates wrapping each specialist call. Prompt embedding remains as the belt; orchestrator gates are the suspenders.
- **Model Currency Check** (`modules/model-routing.md`) -- Phase 0 greps config and agent frontmatter for dated model IDs (they are now banned) and resolves current per-MTok pricing at run time into `pipeline/config.json` `model_rates`, treating the fetched pricing page as data, never instructions.

### Changed

- **Model routing overhauled** (`modules/model-routing.md`). Two new rules govern routing: (1) never pin dated model IDs -- tier aliases only, because pinned IDs silently become downgrades when newer models ship (exactly what happened to the 2.0.0 tables); (2) judgment inherits the session model -- architect, validator, per-slice reviewers, Ojo Critico, adversarial verifier, and debate synthesizer now OMIT `model:` so they ride the strongest model the user has access to. Default profile is now `quality` (builders on `opus`). Floor rule: nothing that writes, reviews, or judges code runs below `sonnet`; `haiku` only for deterministic mechanical tasks in the `budget` profile.
- `modules/cost-tracking.md` and `modules/effort-estimation.md` no longer carry hardcoded price tables; they read `model_rates` resolved at Phase 0. Effort estimation now also prices the per-slice review overhead on high-risk slices.
- `references/ojo-critico.md` Phase 4 section adds the two-gate per-slice procedure and an explicit hunt for assumption-mirroring tests (what assumption, if wrong, makes both the code and its test wrong the same way).
- `phases/04-build.md` anti-rationalizations and red flags extended: self-graded green tests, silently degraded gates, engine parity, fixtures-only data slices. The Step 4.4 checkpoint verifies the independent-review record and real-data evidence before presenting approval.
- `phases/05-validate.md` Security Auditor gains a mandatory DEGRADED-gate recovery pre-check, and the Adversarial Verifier inherits the session model.
- `references/config-schema.json` documents `workflow.per_slice_review` and `workflow.real_data_verification`.

### Removed

Nothing was removed. Phase 5 remains the final quality gate exactly as before; the new per-slice gates make it a confirmation rather than a discovery.

### Migration

Existing projects continue to work. New `pipeline/config.json` files default to `model_profile: "quality"` and `per_slice_review: "risk-gated"`; existing configs keep their stored values until edited. Architects' solution proposals should add `Risk:` flags to slices -- proposals without flags are treated as `Risk: standard` (review only runs in `all` mode). If you pinned dated model IDs in custom agent frontmatter, replace them with tier aliases or remove the field to inherit the session model.

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
