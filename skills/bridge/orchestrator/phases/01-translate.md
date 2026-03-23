# Phase 1: Translate Requirements (BRIDGE B-R-I-D)

Phase 1 performs the business analysis phases of BRIDGE. The Translator focuses on understanding the problem deeply without proposing technical solutions.

## Pre-Phase: Skill Invocations

Before spawning the Translator:
1. `Skill: ask-questions-if-underspecified` (Trail of Bits) → embed in Translator prompt (force clarification of ambiguous requirements instead of assuming)

---

## Step 1.1 - Spawn Translator Agent

Check if `requirements-translator` agent exists via Glob on `agents/requirements-translator.md`.

- If exists: Spawn the `requirements-translator` agent
- If not: Spawn `general-purpose` with translator instructions inline

**Agent description**: `[Phase 1] Requirements Translator — Analyzing business context with BRIDGE framework`
(On retry: `[Phase 1] Requirements Translator — Revising analysis with feedback`)

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Original input: {project-path}/input/original-input.md
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists — non-negotiable)
- Codebase analysis: {project-path}/pipeline/00b-codebase-analysis.md (if exists — brownfield)
- Client knowledge: {client-path}/.knowledge/decisions.md (if exists — prior client context)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)

## Your Task
Produce TWO outputs:
```

### Output 1: BRIDGE Analysis (`pipeline/01a-bridge-analysis.md`)

**B — Business Challenge**
- Literal request (quoted/paraphrased)
- Interpreted business challenge
- Success criteria: what does success look like in 90 days?
- Request type: Symptom Request | Solution Request | Cause Request — reframe toward actual business problem

**R — Root Causes** (apply Fishbone categorization)
- Structure root causes using Fishbone/Ishikawa categories: **People** (skills, capacity, roles), **Process** (workflows, policies, procedures), **Technology** (systems, tools, integrations), **Data** (quality, availability, formats), **Environment** (market, regulatory, organizational), **Measurement** (metrics, KPIs, monitoring gaps)
- For each category: list confirmed causes (from input) and hypothesized causes (inferred — flagged for Phase 2 validation)
- Causal chain analysis: trace from symptoms back through categories to root causes

**I — Impact**
- KPIs off target
- Financial exposure (revenue at risk, cost overruns, opportunity cost)
- Operational friction (manual processes, bottlenecks, error rates)
- Time cost (hours wasted per week/month)

**D — Data and Context (Preliminary)**
- Data sources mentioned (systems, databases, files, APIs)
- Data gaps identified
- Known technical constraints
- Team capabilities and capacity
- Budget context
- Mark items needing validation: `[NEEDS VALIDATION]`

Leave G and E empty: `[To be completed by the Architect in Phase 3]`

### Output 2: Technical Definition (`pipeline/01-technical-definition.md`)

Read `templates/technical-definition.md` for format. Must include:
- Project name and description
- Business Challenge summary (from BRIDGE B)
- Root causes (from BRIDGE R)
- Impact quantification (from BRIDGE I)
- Business objectives (numbered)
- Functional requirements (numbered, priority: HIGH/MEDIUM/LOW)
- Non-functional requirements
- Systems and integrations (from BRIDGE D, with `[NEEDS VALIDATION]` flags)
- Data sources and destinations
- Success criteria (measurable, tied to BRIDGE I metrics)
- Constraints (budget, timeline, technology, compliance)
- Assumptions and out of scope
- Stakeholders

---

## Step 1.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico per `core.md` OJO CRITICO section with Phase 1 focus
2. Output: `pipeline/01c-critical-review.md`
3. If BLOCKED: re-run translator with findings. Max 2 loops.

---

## Step 1.3 - HUMAN APPROVAL GATE

**CHECKPOINT:** Glob for `pipeline/01c-critical-review.md`. If missing and `critical_review=true`, go back to Step 1.2.

Present summary of Technical Definition AND critical review findings.

Options via AskUserQuestion:
- **Approve and continue to Research** — Phase 2
- **Modify** — User provides corrections (re-run with feedback)
- **Stop here and generate deliverables** — Read `modules/deliverable-generation.md` for early exit
- **Restart** — New input

---

## Step 1.4 - Save Output

Write approved Technical Definition to `pipeline/01-technical-definition.md`.
Create pipeline rollback snapshot (read `modules/rollback.md`).
Log cost estimate (read `modules/cost-tracking.md`).
Update TodoWrite.

### Phase Handoff
```markdown
## HANDOFF → Phase 2
- **Status**: COMPLETE
- **Key outputs**: 01-technical-definition.md, 01a-bridge-analysis.md
- **Decisions made**: {key requirements locked}
- **Open questions**: {items marked [NEEDS VALIDATION] for Researcher}
- **Warnings**: {ambiguities, assumptions}
```
