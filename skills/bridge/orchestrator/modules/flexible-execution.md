# Flexible Execution & Reconciliation

The pipeline phases have a DEFAULT order, but the user can request ANY combination or order.

## Flexible Phase Execution

Accept requests like:
- "Run phases 2 and 3 in parallel"
- "Skip to phase 3"
- "Run research first, then go back to requirements"
- "Just run the architect"

### Rules:
1. **Accept any order** — run phases as requested
2. **Identify missing inputs** — check if output file exists in `pipeline/` from a previous run:
   - If exists: use it
   - If doesn't exist: offer options (run prerequisite, proceed without, user provides manually)
3. **Track what ran** — update task list and pipeline folder
4. **Adjust deliverables** — base on what ACTUALLY exists in `pipeline/`

### Dependency Map
```
Phase 1 (Translate) → produces: 01-technical-definition.md
Phase 2 (Research)  → needs: 01 (preferred) | produces: 02-research-report.md
Phase 3 (Architect) → needs: 01 + 02 (preferred) | produces: 03-solution-proposal.md
Phase 4 (Build)     → needs: 02 + 03 (required) | produces: 04-build-manifest.md + code
Phase 5 (Validate)  → needs: 01 + 03 + code (required) | produces: 05-validation-report.md
```

"preferred" = better with it, can run without
"required" = cannot run without

## Parallel Execution with Reconciliation

When phases run in parallel:

**BEFORE:** Identify which outputs feed into others. Mark for reconciliation.

**AFTER:** Check if completed agent's output is dependency of another completed agent.
If YES → RECONCILIATION:

```
=== Reconciliation Needed ===
Phase 2 (Research) completed AFTER Phase 3 (Architect).
Research findings may affect architecture.

Spawning Architect in RECONCILIATION MODE:
- Input: Original architecture (03-solution-proposal.md)
- New input: Research report (02-research-report.md)
- Task: Review architecture against research. Produce UPDATED proposal or confirm "No changes needed."
```

### Reconciliation Triggers
| Scenario | Action |
|----------|--------|
| Research finishes after Architect | Re-run Architect with research |
| Requirements updated after Research | Re-run Research |
| Requirements updated after Architect | Re-run both Research and Architect |
| Build agent updates schema after another | Re-check dependent agents |
| Validator rejects → agent re-runs | Check downstream dependencies |

## Resuming Projects Across Sessions

1. User says "Continue project X" or "Resume {project-name}"
2. Scan `clients/` folder for matching project
3. Read all existing `pipeline/` files → determine completed phases
4. Present status:
```
=== Project Resume: {client} / {project} ===
✅ Phase 1: Technical Definition — COMPLETE
✅ Phase 2: Research Report — COMPLETE
⬜ Phase 3: Solution Proposal — NOT STARTED

What would you like to do?
  a) Continue to next phase
  b) Re-run a specific phase
  c) Review a phase's output
  d) Generate deliverables from what exists
```

## Listing All Projects

When user asks "list projects" or "show clients":

1. Scan `clients/` for all client/project folders
2. Read each README.md and check `pipeline/` files
3. Present summary:
```
=== BRIDGE Pipeline — Clients & Projects ===

📁 acme-corp/
| Project | Created | Phases | Status |
|---------|---------|--------|--------|
| netsuite-migration | 2026-03-01 | 3/5 | Paused at Architecture |
```
