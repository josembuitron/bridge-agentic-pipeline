# Milestone Delivery

Enables incremental delivery after each execution group in Phase 4.

## Definition

A **milestone** = a subset of specialists (execution group) that delivers a working, testable slice of the solution.

## How It Works

Phase 3 (Architect) groups specialists into **Execution Groups** ordered by dependency. Each group IS a milestone.

After each group completes AND passes its approval gate:

### 1. Generate Milestone Deliverable

Write `deliverables/milestone-{N}-{name}.md`:

```markdown
# Milestone {N}: {name}

## What Was Built
{Summary of components completed in this execution group}

## What Works Now
{Cumulative functionality — what the user can test/use}

## Test Results
{Summary of tests passing for this milestone}

## Remaining Milestones
| # | Name | Specialists | Status |
|---|------|------------|--------|
| {N+1} | {name} | {specialist list} | Pending |
| {N+2} | {name} | {specialist list} | Pending |

## What's Next
{Brief description of next milestone's scope}
```

### 2. User Options After Each Milestone

Via AskUserQuestion:
- **Continue to next milestone** — proceed with next execution group
- **Deliver this milestone to client** — generate client deliverable for partial delivery
- **Modify remaining milestones** — adjust scope based on learnings
- **Pause** — stop here, resume later

### 3. Client Deliverable for Partial Delivery

If user chooses to deliver a milestone, generate `deliverables/milestone-{N}-delivery.md`:
- Professional document showing what was built
- Working functionality description
- Architecture diagram showing completed vs remaining
- Sanitized per `modules/sanitization-checklist.md`

## Configuration

```json
// pipeline/config.json
"milestone_delivery": true
```

When `true`: generate deliverables after each execution group.
When `false` (default): generate deliverables only at pipeline end or early exit.

## Integration with Pipeline

The orchestrator checks `config.milestone_delivery` at Step 4.4 (per-specialist approval gate). If true and current specialist is the last in its execution group, trigger milestone deliverable generation before moving to the next group.
