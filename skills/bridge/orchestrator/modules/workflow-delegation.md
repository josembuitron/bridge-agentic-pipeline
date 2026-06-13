# Workflow Delegation -- Dynamic Workflows Integration

<!--
  BRIDGE Development Pipeline
  Architecture and orchestration designed by Jose Milton Buitron
  https://github.com/josembuitron/bridge-agentic-pipeline
-->

## Why this module exists

A Dynamic Workflow is a JavaScript script that Claude writes for a task and a runtime
executes in the background. The loop, the branching, and the intermediate results live in
the script's variables, so the conversation's context window holds only the final answer.
That single property attacks BRIDGE's hardest, most persistent problem: the orchestrator's
context budget. Every fan-out sub-task we move into a workflow is work that no longer
accumulates in the orchestrator's context (see `modules/context-budget.md` and the
Context Anxiety Guard in `core.md`).

This module defines the *narrow* set of places where delegating to a workflow is clearly
worth it, exactly how to do it without breaking BRIDGE's gated spine, and how to fall back.
It is ON by default (`config.advanced_orchestration.workflows.enabled`, default `true`) and
gated by `modules/capability-detection.md`. If Dynamic Workflows is unavailable, every
delegation point silently uses its classic agent path.

## The one hard constraint that shapes everything

A workflow **cannot take user input mid-run** -- only permission prompts can pause it. The
official guidance is blunt: "For sign-off between stages, run each stage as its own
workflow." BRIDGE requires human approval at EVERY phase gate, so:

- **Never** run a whole gated phase, or the whole pipeline, as a single workflow.
- **Only** delegate a self-contained sub-task whose result lands on disk and is then
  presented at the normal human gate. One workflow = one fan-out sub-task, sign-off after.

This is why delegation is limited to research, consolidated review, and large-codebase
analysis: they are high fan-out and need no human input WHILE they run.

## Delegation points

Each point checks, in order: (1) `config.advanced_orchestration.workflows.enabled`,
(2) the matching per-point flag, (3) `capabilities.json → dynamic_workflows.available`.
If any is false, use the classic path. The canonical artifact path is identical either way,
so downstream phases are untouched.

### 1. Phase 2 -- Research (flag: `delegate_research`, default true)
Broad, multi-source research that fans out across angles and cross-checks sources is the
exact shape of the bundled `/deep-research` workflow. Delegate the breadth-gathering portion
to a workflow; keep BRIDGE's D-validation and constraint-locking in the gated phase.

- **How:** ask Claude to run a workflow for the research task -- phrase it with the word
  "workflow" so Claude writes/launches one (e.g., *"Run a workflow to research <D-validation
  questions> across vendor docs, community sources, and changelogs, cross-check claims, and
  return a cited report"*). If a saved `/deep-research` fits, invoke it with `args`.
- **Output:** the workflow's cited report is written to `pipeline/02-research-report.md`
  (same file the classic Researcher would produce). The Researcher's BRIDGE-specific
  sections (D-validated, taint notes) are added in-phase as usual.
- **Fallback:** classic Researcher agent per `phases/02-research.md`.

### 2. Phase 5 -- Consolidated / adversarial review (flag: `delegate_consolidated_review`, default true)
The headline workflow use case is "independent agents adversarially review each other's
findings before they're reported." That is precisely BRIDGE's consolidated review. When
workflows are available, run the independent reviewers as a workflow that cross-checks and
filters findings, then hand the synthesized result to the gated Phase 5.

- **How:** see `modules/consolidated-review.md`, which now selects a workflow engine when
  available. The adversarial structure itself is defined in `modules/adversarial-debate.md`.
- **Output:** findings feed `pipeline/05-validation-report.md` and the review artifacts.
- **Fallback:** the existing background consolidated-review launch.
- **Gate:** the human approval gate ALWAYS runs after the workflow returns. The security
  gate remains BLOCKING regardless of engine.

### 3. Phase 0b -- Large codebase analysis (flag: `delegate_large_codebase_analysis`, default true)
For brownfield projects above a size threshold (heuristic: >200 source files or an explicit
"audit the whole repo" ask), a codebase-wide sweep is the workflow runtime's "500-file
migration / codebase audit" sweet spot.

- **How:** ask Claude to run a workflow that fans an analysis across the tree and returns a
  structured summary.
- **Output:** `pipeline/00b-codebase-analysis.md` (unchanged path).
- **Fallback:** classic Codebase Analyzer per `phases/00b-codebase-analysis.md`.

## Model routing inside workflows

By default every agent in a workflow uses the session's model. To preserve BRIDGE's
cost-aware routing (`modules/model-routing.md`), instruct the workflow to route stages:
heavy-judgment stages (synthesis, verification) OMIT the model so they inherit the session
model -- the strongest available; breadth/research and build stages route to `sonnet`;
nothing that writes or judges code drops below `sonnet`. State this when asking Claude to
write the workflow (e.g., *"use a smaller model for the fan-out fetch stage and omit the
model on the synthesis stage so it inherits the session model"*). Cap concurrency with
`config.advanced_orchestration.workflows.max_agents` (default 16) to bound local resource
use and token spend.

## Saving the fast-track as a reusable workflow (optional)

The `modules/proposal-fast-track.md` flow (deliverable-only projects: collapses to ~3 stages,
little human gating, 30-45 min target) is the best whole-flow candidate to codify as a saved
workflow, because it is the low-human-interaction path workflows are built for. After a
fast-track run that does what you want, save it (`/workflows` → select run → `s`) as
`/bridge-fasttrack` in `.claude/workflows/`. This is opt-in and never replaces the gated
6-phase pipeline.

## Cost awareness

A workflow spawns many agents and can use meaningfully more tokens than the same task in
conversation. Before a large delegated run, gauge spend on a small slice first (one
directory, a narrow question). The `/workflows` view shows per-agent token usage live and
the run can be stopped without losing completed work. Workflow runs count toward plan usage
and rate limits like any session. BRIDGE still logs estimated cost per delegated stage to
`pipeline/cost-log.json` per `modules/cost-tracking.md`.

## What delegation must never change

- The 6-phase gated spine, the human approval at every gate, and the BLOCKING security gate.
- The canonical artifact paths -- a delegated stage writes the same file as its classic path.
- The Zero Assumptions Rule and constraint-locking -- workflows run self-contained sub-tasks,
  never the constraint-gathering or any step that needs user input mid-run.
- Per-client isolation -- a workflow operates on the current project's files only; it does
  not read or write another client's tree.

## Security posture (per references/security-checklist.md change review)

- Workflow-spawned agents inherit the `references/prompt-defense-baseline.md` block and the
  taint protocol. Research delegation hits already-tracked taint sources (WebFetch,
  crawl4ai, Playwright) -- no new untracked taint source is introduced.
- No new installable dependency, MCP, or external service: Dynamic Workflows is a native
  Claude Code surface. No new pinned tool entry required beyond the min-version note in
  `references/bridge-tool-versions.json`.
- New attack surface analysis: the script coordinates agents but has no direct filesystem or
  shell access of its own; agents do the I/O under the session's permission rules and tool
  allowlist. The human gate after each delegated stage preserves oversight.
