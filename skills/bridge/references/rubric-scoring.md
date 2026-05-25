# Rubric Scoring for Critical Review

Ojo Critico produces a verdict at the end of each phase gate (PROCEED or BLOCKED). The verdict is binary and easy for the orchestrator to act on, but it hides why one phase pass is borderline and another is excellent. A single number per phase, derived from a weighted rubric, gives the human reviewer at the approval gate a calibration anchor and lets the project carry a comparable "quality trail" across phases and across projects.

This document defines the rubrics. Ojo Critico reads them and produces both the score table and the existing CRITICAL/WARNING/NOTE findings table on every phase gate.

## How scoring complements the verdict

The CRITICAL/WARNING/NOTE classification stays the dominant signal: any CRITICAL finding still BLOCKS regardless of the score. The score adds:

1. A calibration anchor for "good enough" vs "great" -- two reviews can both say PROCEED but one is at 7.2 and the other at 9.1; the difference matters for confidence at the approval gate.
2. A historical record across projects (`pipeline/ojo-critico-scores.jsonl`, appended once per gate) that surfaces drift -- if Phase 1 scores have been declining for three projects, the Translator prompt or upstream input quality is degrading.
3. A forcing function on the reviewer: assigning a 1-10 score forces it to commit to a position rather than vibing.

## Scoring scale (calibration)

Every criterion scores 1-10. Calibration is shared across phases so a "7" means the same thing everywhere:

| Score | Meaning |
|-------|---------|
| 1-3 | Broken, embarrassing, would not show to anyone |
| 4-5 | Functional but clearly templated, generic, or rushed |
| 6 | Decent but unremarkable, missing polish or depth |
| 7 | Good -- a junior consultant's solid work |
| 8 | Very good -- professional quality, some rough edges |
| 9 | Excellent -- senior consultant quality, polished |
| 10 | Exceptional -- could ship to a Fortune 100 audit committee |

Threshold for PASS at each phase is published below. If the weighted score is below threshold, treat the verdict as BLOCKED even if no individual finding was CRITICAL. This catches the case where everything is "fine" but nothing is good.

## Phase 1 rubric (Translation)

The Translator's job is to extract a Technical Definition and BRIDGE B-R-I-D analysis from unstructured input. Quality means faithful, complete, measurable, and free of invented detail.

| Criterion | Weight | What to score |
|-----------|--------|---------------|
| Input faithfulness | 0.30 | Every explicit requirement from the input shows up in the Technical Definition. Nothing was dropped. Nothing was added that the input did not imply. |
| BRIDGE B-R-I-D depth | 0.25 | Business challenge is the real problem, not the symptom. Root causes are causal, not restatement. Impact has KPIs and exposure. Data section names systems and constraints. |
| Success criteria measurability | 0.20 | Every success criterion is specific and verifiable ("reduce report build time from 12s to under 2s" not "improve performance"). |
| Assumption discipline | 0.15 | Zero invented assumptions. Anything inferred is flagged and locked in `00-constraints.md` via the Assumption Elimination Gate. |
| Clarity | 0.10 | Written so a senior engineer who did not attend the meeting can pick up the project from this document alone. |

Threshold for PASS: weighted score >= 7.0

## Phase 2 rubric (Research)

The Researcher validates the D-preliminary from Phase 1 and produces a Research Report with verified tech stack, security/taint assessment, and force-field analysis.

| Criterion | Weight | What to score |
|-----------|--------|---------------|
| Verification depth | 0.30 | API capabilities were tested, not just described from docs. Rate limits, auth complexity, deprecations called out. CONFIRMED vs NOT AVAILABLE vs CORRECTED tags applied to each D-preliminary item. |
| Tradeoff honesty | 0.20 | Alternatives genuinely compared with driving vs restraining forces, scored 1-5. No rubber-stamping the first option. |
| Pricing completeness | 0.20 | Costs include compute + storage + egress + licensing. Not just headline price. Current as of the research date. |
| Security and taint coverage | 0.20 | Every untrusted source classified. Every critical sink mapped. Tool risk assessment populated. |
| Currency and source quality | 0.10 | Sources are current (within 12 months) and primary (vendor docs, status pages) over secondary (blog posts, AI-generated wikis). |

Threshold for PASS: weighted score >= 7.5

## Phase 3 rubric (Architecture)

The Architect produces the Solution Proposal with architecture diagrams, cost models, specialist team spec, vertical slice decomposition, and methodology selection.

| Criterion | Weight | What to score |
|-----------|--------|---------------|
| Root-cause alignment | 0.25 | Architecture addresses BRIDGE R (root causes), not the symptom request. Each use case maps to a root cause. |
| Decomposition quality | 0.25 | Specialist responsibilities are clear, non-overlapping, and independently buildable. Vertical slices have no hidden dependencies. Walking skeleton is a real walking skeleton. |
| Cost realism | 0.15 | All infrastructure included, not just primary compute. Pricing tied to actual vendor SKUs. Reasonable buffer for the unknown. |
| Failure mode coverage | 0.15 | Single points of failure called out. Degraded modes specified. Operational concerns (backup, monitoring, on-call) addressed. |
| Methodology fit | 0.10 | The CT methodology selection (Phase 3c) matches project characteristics. Six Thinking Hats and Force-Field analysis are populated, not skipped. |
| Buildability evidence | 0.10 | File manifest exists. Specialist specs include task, tools, methodology, completion signal. No specialist is left as "engineer-tbd". |

Threshold for PASS: weighted score >= 7.5

## Phase 5 rubric (Validation and Delivery)

Phase 5 already produces a composite `quality_score` (requirements 0.35 + tests 0.25 + security 0.20 + code 0.10 + docs 0.10) that determines APPROVE/CONDITIONAL/REJECT. Ojo Critico's rubric at Phase 5 is a meta-review of the Phase 5 outputs themselves, not the project: did the validation actually validate?

| Criterion | Weight | What to score |
|-----------|--------|---------------|
| Validation evidence | 0.30 | Every REQ has traceability to file:line. Stubs and TODOs were detected. Coverage numbers are real (vitest output, not estimated). |
| Security depth | 0.25 | SAST ran. Secrets scan ran. Dependency audit ran. OWASP Top 10 was actually walked, not checked off. Findings are triaged with fp-check. |
| Multi-pass review thoroughness | 0.20 | All 6 PR-review passes produced concrete observations, not "looks good". Silent failures hunter actually found something or proved there is nothing to find. |
| Adversarial verification | 0.15 | Adversarial verifier executed code (curl, Playwright). Tried boundary values, idempotency, type confusion. Did not just "look at the code". |
| Deliverable sanitization | 0.10 | Client deliverables in `deliverables/` carry zero references to agents, pipeline internals, or AI. Sanitization checklist enforced. |

Threshold for PASS: weighted score >= 7.5

## Output format Ojo Critico uses

When Ojo Critico writes its phase output (`pipeline/{NN}c-critical-review.md`), the first block under "Summary" is the score table for the phase being reviewed:

```markdown
## Rubric Scores -- Phase {N}

| Criterion | Score (1-10) | Weight | Weighted | Evidence |
|-----------|--------------|--------|----------|----------|
| Input faithfulness | 8 | 0.30 | 2.40 | All REQs trace to input. No invented additions. |
| BRIDGE B-R-I-D depth | 6 | 0.25 | 1.50 | Root causes restate symptoms instead of going deeper. |
| Success criteria measurability | 7 | 0.20 | 1.40 | 4 of 6 criteria are measurable. Two are vague. |
| Assumption discipline | 9 | 0.15 | 1.35 | All inferences flagged. |
| Clarity | 8 | 0.10 | 0.80 | Reads cleanly end-to-end. |
| **Weighted total** | | | **7.45** | PASS (threshold 7.0) |
```

The weighted total is included in the verdict line at the bottom of the review.

## Persistent score log

After each gate, Ojo Critico appends one line to `pipeline/ojo-critico-scores.jsonl`:

```json
{"phase":1,"weighted":7.45,"threshold":7.0,"pass":true,"timestamp":"2026-05-25T14:30:00Z","critical_count":0,"warning_count":2}
```

This file makes the score history queryable across projects (which clients have the worst Phase 1 scores? do scores improve with returning clients?) without parsing markdown.
