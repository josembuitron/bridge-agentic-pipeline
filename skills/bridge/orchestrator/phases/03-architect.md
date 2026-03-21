# Phase 3: Architect Solution (BRIDGE G-E)

## Pre-Phase: Skill Invocations (Orchestrator as Methodology Gateway)

Before spawning the Architect, the orchestrator MUST invoke these skills and embed the methodology:

1. `Skill: superpowers:brainstorming` → embed in Architect prompt (explore 2-3 approaches)
2. `Skill: superpowers:writing-plans` → embed in Architect prompt (structure specialist breakdown)
3. `Skill: entry-point-analyzer` (Trail of Bits) → embed in Architect prompt (attack surface mapping)
4. `Skill: insecure-defaults` (Trail of Bits) → embed in Architect prompt (flag insecure defaults)
5. `Skill: audit-context-building` (Trail of Bits) → embed in Architect prompt (deep architectural context: modules, entrypoints, actors, storage mapping)
6. If brownfield (codebase exists): `Skill: spec-to-code-compliance` (Trail of Bits) → embed in Architect prompt (verify existing code against new spec)

Cache these for the session — no need to re-invoke.

---

## Step 3.1 - Spawn Architect Agent

Check if `solution-architect` agent exists. Spawn accordingly.

**Agent description**: `[Phase 3] Solution Architect — Designing architecture and agent team`
(On retry: `[Phase 3] Solution Architect — Revising architecture with feedback`)

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- Research Report: {project-path}/pipeline/02-research-report.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md (has B, R, I from Translator + D-validated from Researcher)
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Codebase analysis: {project-path}/pipeline/00b-codebase-analysis.md (if exists — brownfield)
- Client knowledge: {client-path}/.knowledge/graph.json (if exists — past decisions, anti-patterns)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)
```

### BRIDGE G and E (FIRST TASK)

**G — Generate Use Cases** (add to `pipeline/01a-bridge-analysis.md`)
- 3-5 specific use cases using validated B, R, I, D
- For each: type, technique, required inputs, expected outputs, business value
- Map each to root causes (R) it addresses
- Map each to impact metrics (I) it will move

**E — Evaluate Feasibility** (add to `pipeline/01a-bridge-analysis.md`)
- Technical viability per use case
- Data availability (confirmed from D-validated)
- Complexity: Low/Medium/High
- Timeline: quick win (<2 weeks), medium (2-8 weeks), long-term (8+ weeks)
- Risk factors and mitigations
- Prioritized recommendation: which use cases first

### Solution Proposal (ALL sections required)

- **A. Architecture Overview** — Components, Mermaid diagrams, data flow
- **B. File Manifest** — Every file to create with purpose
- **C. Technology Stack** — Versions and justification
- **D. REQUIRED SPECIALISTS** — For each: role, description, task, tools, knowledge_keys, model, depends_on
- **D.1 VERTICAL SLICES PER SPECIALIST** — Ordered slices per specialist (see below)
- **E. Execution Groups** — Dependency-ordered with parallel/sequential flag
- **F. Deployment Strategy**
- **G. Testing Strategy**

### Vertical Slicing Rules

Each specialist's task MUST be decomposed into ordered vertical slices:

```markdown
### Specialist: {role}
#### Slice 1 (Walking Skeleton): {description}
- Scope: Minimal end-to-end proof the integration/component works
- Deliverable: {what user gets if pipeline stops here}
- Tests: {acceptance criteria}

#### Slice 2: {description}
...
```

1. Slice 1 = Walking Skeleton — thinnest possible end-to-end implementation
2. Each slice MUST be independently testable and deliverable
3. INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable
4. Target 2-5 slices per specialist
5. Order by value and dependency

Read `templates/solution-proposal.md` for output format.

---

## Step 3.1b - Generate Architecture Diagram Images (OPTIONAL)

If Excalidraw MCP available:
1. `mcp__excalidraw__create_from_mermaid` with each Mermaid diagram
2. `mcp__excalidraw__add_library` for platform icons (Azure, AWS, GCP, K8s)
3. `mcp__excalidraw__export_to_image` → save to `deliverables/images/`
4. Optionally `mcp__excalidraw__export_to_excalidraw_url` for shareable links

If NOT available: skip silently. Mermaid markdown is sufficient.

---

## Step 3.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico with Phase 3 focus (architecture review)
2. Output: `pipeline/03c-critical-review.md`
3. If BLOCKED: re-run architect with findings. Max 2 loops.

---

## Step 3.3 - HUMAN APPROVAL GATE (MOST IMPORTANT)

**CHECKPOINT:** Glob for `pipeline/03c-critical-review.md` (if critical_review=true) and `pipeline/03b-plan-check.md` (if plan_checker=true).

Present full Solution Proposal summary including agent team roster AND critical review findings.

Options via AskUserQuestion:
- **Approve and start building** — Phase 4
- **Modify architecture** — Changes to design
- **Modify agent team** — Add/remove/change specialists
- **Stop here and generate deliverables** — MOST COMMON exit point. Read `modules/deliverable-generation.md`
- **Go back to Research** — Need more investigation

---

## Step 3.4 - Save Output

Write to `pipeline/03-solution-proposal.md`.
Create pipeline rollback snapshot (read `modules/rollback.md`).
Log cost estimate (read `modules/cost-tracking.md`).
Update TodoWrite.

---

## Step 3.5 - Plan-Checker (if config.workflow.plan_checker)

Spawn plan-checker agent:
**Agent description**: `[Phase 3b] Plan Checker — Verifying build plan will achieve goals`

Checks 7 dimensions:
1. **Requirement coverage**: Every REQ maps to at least one slice
2. **Dependency correctness**: No slice depends on output from a later slice
3. **Key links planned**: Critical connections explicitly addressed
4. **Scope sanity**: No specialist > 5 slices or < 1
5. **Test coverage**: Every slice has acceptance criteria
6. **Integration gaps**: Data contracts between specialists defined
7. **BRIDGE alignment**: Use cases (G) address root causes (R) and move impact metrics (I)

Output: `pipeline/03b-plan-check.md` with PASS/FAIL per dimension.
If FAIL: re-spawn Architect with feedback. Max 3 loops.

### Phase Handoff
```markdown
## HANDOFF → Phase 4
- **Status**: COMPLETE
- **Key outputs**: 03-solution-proposal.md, specialist definitions, slice breakdown
- **Decisions made**: {architecture choices, technology selections, team composition}
- **Open questions**: {implementation details deferred to specialists}
- **Warnings**: {complexity areas, integration risks, known limitations}
```
