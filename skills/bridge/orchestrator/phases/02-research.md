# Phase 2: Research Technologies

## Step 2.1 - Spawn Researcher Agent

Check if `researcher` agent exists. Spawn accordingly.

**Agent description**: `[Phase 2] Technology Researcher — Investigating APIs, tools, and integrations`
(On retry: `[Phase 2] Technology Researcher — Deepening research on {specific area}`)

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md (focus on D-preliminary [NEEDS VALIDATION] items)
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Codebase analysis: {project-path}/pipeline/00b-codebase-analysis.md (if exists — brownfield constraints)
- Client knowledge: {client-path}/.knowledge/graph.json (if exists — known tech stack, anti-patterns)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)
```

### BRIDGE D-Validated (FIRST TASK)

Before general research, validate every `[NEEDS VALIDATION]` item from D-preliminary:
- For each system/API: confirm existence, current API version, auth methods, rate limits, pricing
- For each data source: verify accessibility, format, volume, update frequency
- For each technical constraint: confirm or correct from current docs
- Update `pipeline/01a-bridge-analysis.md` — add **D — Data and Context (Validated)** section
- Mark each item: `[CONFIRMED]`, `[CORRECTED: ...]`, or `[NOT AVAILABLE]`
- Flag any hypothesized root causes from BRIDGE R that research confirms or invalidates

### Standard Research

Use **documentation access strategy** (read `modules/doc-access-strategy.md`):
1. For each system/integration: Context7 for code libs, crawl4ai for enterprise/API docs, WebSearch as fallback
2. For each capability: research best tools, compare with pros/cons
3. Save scraped docs to `.crawl4ai/` for other agents
4. Produce Research Report with: API Docs, MCP Servers, Recommended Stack, Best Practices, Risks, Cost/Licensing, Key Findings
5. Map findings back to BRIDGE root causes (R) and impact metrics (I)

---

## Step 2.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico with Phase 2 focus (research review)
2. Output: `pipeline/02c-critical-review.md`
3. If BLOCKED: re-run researcher with findings. Max 2 loops.

---

## Step 2.3 - HUMAN APPROVAL GATE

**CHECKPOINT:** Glob for `pipeline/02c-critical-review.md`. If missing and `critical_review=true`, go back to Step 2.2.

Present Research Report summary AND critical review findings.

Options via AskUserQuestion:
- **Approve and continue to Architecture** — Phase 3
- **Research more** — Specify areas for deeper investigation
- **Modify** — Add preferences or constraints
- **Stop here and generate deliverables** — Read `modules/deliverable-generation.md`
- **Go back to Requirements** — Modify Technical Definition

---

## Step 2.4 - Save Output

Write to `pipeline/02-research-report.md`.
Create pipeline rollback snapshot (read `modules/rollback.md`).
Log cost estimate (read `modules/cost-tracking.md`).
Update TodoWrite.

### Phase Handoff
```markdown
## HANDOFF → Phase 3
- **Status**: COMPLETE
- **Key outputs**: 02-research-report.md, updated 01a-bridge-analysis.md (D-validated)
- **Decisions made**: {technology recommendations, API capabilities confirmed}
- **Open questions**: {areas where docs were unclear, pricing needing confirmation}
- **Warnings**: {rate limits, deprecation notices, licensing concerns}
```
