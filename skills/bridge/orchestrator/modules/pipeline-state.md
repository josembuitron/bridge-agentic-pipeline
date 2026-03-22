# Pipeline State File

Provides a quick-read index of pipeline progress for resumability. The state file is an **index** — the source of truth remains the actual files in `pipeline/`.

## Schema

After each phase approval, the orchestrator writes/updates `pipeline/state.json`:

```json
{
  "current_phase": 3,
  "status": "active",
  "completed_phases": [0, 1, 2, 3],
  "last_completed": "2026-03-22T14:30:00Z",
  "specialists_total": 4,
  "specialists_completed": 2,
  "current_specialist": "spec-api",
  "budget_cap_usd": null
}
```

### Field definitions

| Field | Type | Description |
|-------|------|-------------|
| `current_phase` | number | Phase the pipeline is currently in (0-5) |
| `status` | string | `"active"`, `"paused"`, `"completed"`, `"failed"` |
| `completed_phases` | number[] | List of phase numbers that were approved |
| `last_completed` | string | ISO timestamp of last phase approval |
| `specialists_total` | number | Total specialists from Phase 3 (0 if not in Phase 4+) |
| `specialists_completed` | number | How many specialists have finished |
| `current_specialist` | string | Name of the specialist currently building (empty if not in Phase 4) |
| `budget_cap_usd` | number or null | Budget cap from config.json (null = no limit) |

**Design principle**: All fields are flat (no nested objects). An LLM can write this JSON reliably every time.

## When to Write

| Event | Action |
|-------|--------|
| Phase N approved by user | Set `current_phase: N+1`, add N to `completed_phases`, update `last_completed` |
| Phase 4 specialist completes | Increment `specialists_completed`, update `current_specialist` to next |
| Pipeline paused or early exit | Set `status: "paused"` |
| Pipeline completed | Set `status: "completed"` |
| Pipeline fails unrecoverably | Set `status: "failed"` |

## When to Read

### On resume ("Continue project X")

1. Read `pipeline/state.json` FIRST
2. If it exists: use it to determine where to resume. This is faster than scanning all files.
3. If it does NOT exist but `pipeline/` has files: **reconstruct** state.json from existing files (backward compatibility with projects created before this module existed):
   - Glob `pipeline/0*.md` to find which phases completed
   - Set `current_phase` to the next unfinished phase
   - Set `status: "paused"`
   - Write the reconstructed state.json

### On context refresh (Rule 7 of context-budget.md)

Re-read state.json to re-orient after context degradation.

## Consistency Rule

state.json is an **index**, not the source of truth. If state.json says Phase 2 is complete but `pipeline/02-research-report.md` doesn't exist, the file system wins — re-run Phase 2.

The orchestrator should NEVER trust state.json blindly. After reading it, Glob for the expected artifacts of the claimed completed phases. If any are missing, correct state.json and inform the user.
