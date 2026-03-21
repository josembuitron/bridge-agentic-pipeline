# Phase 4: Build Solution (Dynamic Agents)

## Pre-Phase: Skill Invocations

Before spawning first specialist (once per session):
1. `Skill: superpowers:test-driven-development` → embed TDD in ALL specialist prompts
2. `Skill: sharp-edges` (Trail of Bits) → embed dangerous API patterns warning
3. If critical business logic: `Skill: property-based-testing` (Trail of Bits)

Cache and reuse across all specialists.

---

## Step 4.1 - Create/Update Specialist Agents

Read Solution Proposal. Parse REQUIRED SPECIALISTS.

For EACH specialist:

**Check existence:** Glob for `.claude/agents/spec-{role}.md`

### IF NOT EXISTS — CREATE:
1. Read `templates/agent-template.md`
2. Read relevant Research Report sections
3. Compose agent .md file:
```yaml
name: spec-{role}
description: {from architect}
tools: {from architect, MUST include Bash for code-writers}
memory: project
model: {from architect — read modules/model-routing.md}
maxTurns: 50
```
4. Assign methodologies per `modules/tool-matrix.md`
5. Add Completion Signal:
```
## Completion Signal
When slice is complete (code written, tests passing, files committed):
BRIDGE_SLICE_COMPLETE: {slice_id}
Do NOT output until tests pass and deliverables are committed.
```
6. Write to `.claude/agents/spec-{role}.md`
7. Mark as NEW (spawn as `general-purpose` this session)

### IF EXISTS — UPDATE:
1. Read current agent file
2. Compare with Research Report
3. Edit if outdated
4. Mark as EXISTING (spawn by name)

**Log team roster** to `pipeline/04-build-manifest.md`

---

## Step 4.2 - HUMAN APPROVAL GATE (Team Review)

Present team roster via AskUserQuestion:
- **Start building**
- **Modify team**
- **Review agent definition**
- **Stop here and generate deliverables**

---

## Step 4.3 - Execute Build Groups (Vertical Slice Execution)

For each execution group in dependency order, for each specialist, execute **slice by slice**:

### Per Slice:

1. Read Solution Proposal + current slice definition + relevant Research Report sections

2. Spawn agent:
   - EXISTING: by name
   - NEW: as `general-purpose` with full prompt inline

3. **Agent description**: `[Phase 4] {Name} — Slice {N}: {summary}`
   On fix: `[Phase 4] {Name} — Fixing Slice {N}: {issue}`

4. **Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md (YOUR specialist section)
- Research Report: {project-path}/pipeline/02-research-report.md (relevant tech sections)
- Plan Check: {project-path}/pipeline/03b-plan-check.md (if exists — flagged issues)
- Constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Previous slice summary: {project-path}/pipeline/04-{specialist}-slice-{N-1}-summary.md (if exists)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)

## Your Slice
Specialist: {role} | Slice: {N} | Scope: {description}
Acceptance criteria: {criteria}
File manifest: {files to create/modify}
```

5. **Code Knowledge Graph** (if `code-review-graph` available):
   - Build graph: `code-review-graph build`
   - Use impact_radius, callers_of, callees_of before modifying code

6. **Serena Code Intelligence** (if available):
   - `find_symbol`, `find_referencing_symbols`, `replace_symbol_body`, `rename_symbol`
   - Prefer Serena over Edit for modifying existing symbols

7. Agent writes to `src/` and `tests/`

### Dev-QA Loop Per Slice

```
BUILD (TDD: RED → GREEN → REFACTOR)
  ↓
TEST (run: npx vitest run)
  ↓
HARDEN (2-4 additional tests: error paths, boundaries, concurrency, invalid input)
  ↓
E2E (if frontend: Playwright smoke test)
  ↓
VERIFY: ALL tests pass AND acceptance criteria met?
  ├─ YES → BRIDGE_SLICE_COMPLETE → next slice
  └─ NO → RETRY (max 3 attempts, then ESCALATE to human)
```

**Rules:**
- Max 3 attempts per slice. After 3: escalate with root cause analysis
- Each retry MUST include failure reason from previous attempt
- Slice 1 failures escalate immediately (no retries) — Walking Skeleton failure = architecture wrong

### Post-Slice Security Scan (MANDATORY)

After EACH specialist completes AND user approves:
```bash
semgrep scan --config auto clients/{c}/{p}/src/ 2>/dev/null
```
- CRITICAL findings → BLOCK next specialist. Present options: Fix now | Override with risk | Abort
- WARNINGS → log and continue, present in approval gate

---

## Step 4.4 - HUMAN APPROVAL GATE (Per Slice or Per Specialist)

**CHECKPOINT:**
1. Glob for build artifacts in `src/`. Zero files = silent failure — re-run.
2. Verify `BRIDGE_SLICE_COMPLETE` signal. No signal = stall (see below).
3. After ALL specialists: create/update `pipeline/04-build-manifest.md`.

Present via AskUserQuestion:
- Slice completed and what it delivers
- Files created/modified
- Tests passing
- Cumulative functionality

Options:
- **Approve and continue to next slice**
- **Approve all remaining slices** — skip per-slice review
- **Request changes to this slice** — re-run with feedback
- **Skip remaining slices** — accept thin functionality, next specialist
- **Review code** — show specific files
- **Pause pipeline and generate deliverables**
- **Pause pipeline** — resume later

### Milestone Delivery (if config enables — read `modules/milestone-delivery.md`)
After each execution group completes AND passes approval, optionally generate milestone deliverable.

---

## Orchestrator as Loop Monitor (Stall Detection)

After each Agent call returns, inspect:
- Contains `BRIDGE_SLICE_COMPLETE`? → Normal exit
- Error keywords ("failed", "cannot", "unable")? → Stall: surface to human
- No output / maxTurns hit? → Timeout stall
- Partial progress (some files, no signal)? → Partial stall

**On stall:**
```
⚠️ Specialist stall: {agent-name}, Slice {N}
Status: {what was found}

Options:
  a) Re-run from scratch
  b) Re-run with a hint
  c) Skip this slice
  d) Reduce scope
  e) Pause and generate deliverables
```

- Same slice stalls 2×: auto-escalate to user hint
- Slice 1 stall: always escalate immediately

---

## Step 4.5 - De-Sloppify Pass (if config.workflow.de_sloppify — default: true)

**Agent description**: `[Phase 4] Code Cleanup — Removing dead code and improving clarity`

Spawn `general-purpose` with focused cleanup instructions:
- Remove dead code, unused imports, commented-out blocks
- Fix naming inconsistencies
- Correct inaccurate comments
- Fix YAGNI violations
- Remove debug statements
- Run eslint/linting
- Do NOT change architecture, logic, or add features
- Run tests after cleanup

Skip if: <200 lines total, time-critical, or user asks to skip.

---

## Step 4.6 - Update Build Manifest

Update `pipeline/04-build-manifest.md` with final status per specialist and slice.

---

## Step 4.7 - Archive Successful Specialists (after Phase 5 validates)

Copy `spec-{role}.md` to `.claude/agents/library/spec-{role}-{project-slug}.md` with Track Record section.
On future runs: Glob `agents/library/spec-*.md` for relevant technology matches.

### Phase Handoff
```markdown
## HANDOFF → Phase 5
- **Status**: COMPLETE
- **Key outputs**: 04-build-manifest.md, all src/ and tests/ files
- **Decisions made**: {implementation choices by specialists}
- **Open questions**: {deferred items, known limitations}
- **Warnings**: {security scan findings, skipped slices, partial implementations}
```
