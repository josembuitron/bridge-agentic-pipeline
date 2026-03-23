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
- Timeline category: quick win (<2 weeks), medium (2-8 weeks), long-term (8+ weeks)
- Risk factors and mitigations
- Prioritized recommendation: which use cases first

> **Note:** These are high-level feasibility buckets only. Detailed effort estimation with roles, hours, tokens, and 3-scenario analysis is produced in **Step 3.3** by the Effort Estimator Agent.

### Solution Proposal (ALL sections required)

Before finalizing, apply **SCAMPER** to challenge the proposed design:
- **Substitute**: What component could be replaced with something simpler or more proven?
- **Combine**: What components could be merged to reduce complexity?
- **Eliminate**: What can be removed without losing core functionality?
Document findings briefly in the Architecture Overview. This prevents over-architecture.

- **A. Architecture Overview** — Components, Mermaid diagrams, data flow
- **B. File Manifest** — Every file to create with purpose
- **C. Technology Stack** — Versions and justification
- **D. REQUIRED SPECIALISTS** — For each: role, description, task, tools, knowledge_keys, model, depends_on
- **D.1 VERTICAL SLICES PER SPECIALIST** — Ordered slices per specialist (see below)
- **E. Execution Groups** — Dependency-ordered with parallel/sequential flag
- **F. Deployment Strategy**
- **G. Testing Strategy**
- **H. Security Guardrails** (from Phase 2 Security & Taint Assessment) — For each HIGH-risk integration: input validation approach, output sanitization, approval gates. Reference `references/tool-risk-matrix.md` for risk classification.
- **I. Project Quality Hooks** (if `config.harness_hooks.project_hooks` != `"off"`) — Pre-commit hooks for the tech stack. Read `modules/harness-hooks.md` for templates per stack. Specify: hook name, command, purpose, whether blocking in enforce mode.

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

## Step 3.1b - (Moved to Step 3.3b)

Architecture diagram generation with cloud provider icons is now handled in **Step 3.3b** using a multi-tool chain: `diagrams` (Python) → D2 → Excalidraw (MCP) → Mermaid fallback. See Step 3.3b below and `modules/architecture-diagrams.md` for full details.

---

## Step 3.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico with Phase 3 focus (architecture review)
2. Output: `pipeline/03c-critical-review.md`
3. If BLOCKED: re-run architect with findings. Max 2 loops.

---

## Step 3.3 - Effort Estimation (3 Scenarios)

After the architecture is complete (and critical review if enabled), spawn the **Effort Estimator Agent** to produce three execution scenarios.

**Agent description**: `[Phase 3d] Effort Estimator — Calculating 3-scenario execution estimates`

Check if `effort-estimator` agent exists. Spawn accordingly.

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md
- Research Report: {project-path}/pipeline/02-research-report.md
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- Available Plugins: skills/bridge/orchestrator/modules/available-plugins.md
- Tool Matrix: skills/bridge/orchestrator/modules/tool-matrix.md
- Estimation Methodology: skills/bridge/orchestrator/modules/effort-estimation.md

## Your Task
Produce 3-scenario effort estimation following the methodology in effort-estimation.md.
Read the template at templates/effort-estimation.md for output format.

## Output
Write results to: {project-path}/pipeline/03d-effort-estimation.md
```

**Output**: `pipeline/03d-effort-estimation.md` with:
- **Scenario A (Human-Only):** Roles, count, dedication %, hours/week, total hours, timeline with Gantt
- **Scenario B (Bridge-Only):** Autonomy assessment per slice, token estimates (input/output), cost, time, feasibility verdict
- **Scenario C (Hybrid):** Optimal split with Bridge tokens + human hours, combined timeline
- **Comparison table:** Side-by-side all 3 scenarios

The orchestrator reads `03d-effort-estimation.md` and presents the comparison summary at the Human Approval Gate (Step 3.7).

---

## Step 3.3b - Architecture Diagram Generation

After the solution proposal is complete, generate professional architecture diagrams with cloud provider icons.

Read `modules/architecture-diagrams.md` for the full tool chain and instructions.

**Quick flow:**
1. Check tool availability:
   ```bash
   python -c "import diagrams" 2>/dev/null && echo "DIAGRAMS_OK" || echo "DIAGRAMS_MISSING"
   which d2 2>/dev/null && echo "D2_OK" || echo "D2_MISSING"
   ```
2. If `diagrams` available: architect generates `scripts/generate-architecture.py` → execute → SVG in `deliverables/images/`
3. If `diagrams` missing: auto-install (`pip install diagrams` + graphviz) and retry
4. If D2 available (and diagrams not): generate `.d2` files → execute → SVG
5. If Excalidraw MCP available: use Excalidraw MCP tools (see `modules/architecture-diagrams.md` Tool 3)
6. Fallback: Mermaid in markdown (no blocking)

**Minimum diagrams to generate:**
- System Architecture (high-level components with cloud service icons)
- Data Flow (how data moves between components)
- Deployment Architecture (infrastructure topology)

All SVG files go to `deliverables/images/` for embedding in the HTML deliverable with pan/zoom.

---

## Step 3.6 - Methodology Selection (CT-driven)

After Plan-Checker (if enabled) and before the human approval gate, select the development methodology.

**Agent description**: `[Phase 3c] Methodology Selector — Choosing optimal development approach`

Spawn `general-purpose` agent with:

```
## Your Role: Methodology Selector
Select the optimal development methodology for this project using Critical Thinking.

## Context Files (read these)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md (REQ count, project type)
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md (specialist count, slices, complexity)
- Methodology Catalog: skills/bridge/ct/methodologies/catalog.json
- Past Insights: skills/bridge/memory/insights.json (if exists — patterns from previous projects)

## Analysis Method
1. Read catalog.json. Filter to frameworks with bridge_compatibility > 0.6
2. Apply Six Thinking Hats analysis on the top 5 candidates:
   - WHITE (data): How many REQs? How many specialists? What timeline? What complexity?
   - RED (intuition): What type of project does this feel like? What worked in insights.json?
   - BLACK (risks): What could go wrong with each methodology for THIS specific project?
   - YELLOW (benefits): What does each methodology optimize that THIS project needs most?
   - GREEN (creative): Can 2 methodologies be combined for better fit?
   - BLUE (process): Which methodology best controls THIS type of project?
3. Apply Force-Field on the top 2 candidates (driving vs restraining forces, scored 1-5)
4. Select winner and define config adjustments

## Output
Write to: {project-path}/pipeline/03c-methodology-selection.md

Format:
# Methodology Selection

## Selected Methodology
- Primary: {name}
- Secondary (if hybrid): {name}
- Confidence: {0.0-1.0}

## Six-Hats Summary
- WHITE: {1-2 sentences with key data points}
- RED: {1-2 sentences}
- BLACK: {1-2 sentences — key risks}
- YELLOW: {1-2 sentences — key benefits}
- GREEN: {1-2 sentences — creative combinations considered}
- BLUE: {1-2 sentences — process recommendation}

## Force-Field Analysis (Top 2)
| Candidate | Driving Forces (total) | Restraining Forces (total) | Net Score |
|-----------|----------------------|---------------------------|-----------|

## Config Adjustments
{JSON block of config.json changes this methodology requires — from catalog.json config_adjustments}

## Justification
{3-5 sentences explaining why this methodology fits this specific project}
```

The orchestrator reads the output and applies `config_adjustments` to `pipeline/config.json` BEFORE Phase 4 starts. These adjustments change Phase 4 behavior (gate frequency, parallelization, testing rigor, etc.).

---

## Step 3.7 - HUMAN APPROVAL GATE (MOST IMPORTANT)

**CHECKPOINT:** Glob for `pipeline/03c-critical-review.md` (if critical_review=true), `pipeline/03b-plan-check.md` (if plan_checker=true), `pipeline/03c-methodology-selection.md`, and `pipeline/03d-effort-estimation.md`.

Present full Solution Proposal summary including:
1. Architecture overview and agent team roster
2. Critical review findings (if enabled)
3. Selected methodology with justification
4. **3-Scenario Effort Estimation comparison table** (from `03d-effort-estimation.md`)
   - Scenario A: Human-Only (team size, total hours, calendar weeks)
   - Scenario B: Bridge-Only (tokens, cost, feasibility verdict)
   - Scenario C: Hybrid (recommended — combined timeline)

Options via AskUserQuestion:
- **Approve and start building** — Phase 4
- **Modify architecture** — Changes to design
- **Modify agent team** — Add/remove/change specialists
- **Modify estimation assumptions** — Adjust roles, dedication, or Bridge capability assessment
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
- **Key outputs**: 03-solution-proposal.md, 03d-effort-estimation.md, specialist definitions, slice breakdown, architecture SVGs
- **Decisions made**: {architecture choices, technology selections, team composition, execution scenario selected}
- **Effort scenario selected**: {A/B/C — as approved by user at gate 3.7}
- **Open questions**: {implementation details deferred to specialists}
- **Warnings**: {complexity areas, integration risks, known limitations}
```
