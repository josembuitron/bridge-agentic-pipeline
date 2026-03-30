# Status Dashboard (Zero Token Cost)

A deterministic Node.js script generates a self-contained HTML dashboard from existing pipeline JSON files. The LLM does NOT generate the HTML. The script does.

## How It Works

```
pipeline/state.json     ─┐
pipeline/cost-log.json   ├─→ [Node.js script] ─→ pipeline/dashboard.html
pipeline/config.json     │
pipeline/05-*.md         ─┘
```

**Token cost: ~50 tokens per invocation** (just the Bash command to run the script).

## When to Run

After EACH of these events, the orchestrator runs the dashboard script:

1. **Phase completion** (after writing phase artifacts and updating state.json)
2. **Specialist completion** (after updating state.json with specialist progress)
3. **Phase 5 final** (after all validators complete, before presenting to user)

## How to Run

```bash
node {skill-path}/orchestrator/scripts/generate-dashboard.js {project-path}
```

Where:
- `{skill-path}` is the BRIDGE skill directory (e.g., `~/.claude/skills/bridge`)
- `{project-path}` is the project directory (e.g., `clients/acme/dashboard-project`)

The script outputs to `{project-path}/pipeline/dashboard.html`.

## What the Dashboard Shows

| Metric | Source |
|--------|--------|
| Current phase | state.json |
| Specialist progress (N/M completed) | state.json |
| Currently active specialist name | state.json |
| Estimated cost | cost-log.json |
| Budget cap and utilization | config.json |
| Phase completion status (visual) | Glob for phase artifacts |
| BRIDGE letter mapping per phase | Hardcoded in script |
| Security verdict (SECURE/BLOCKED) | 05c-security-audit.md |
| Quality score | quality-score.json |
| Cost breakdown by agent/phase/model | cost-log.json entries |
| Pipeline status (active/paused/completed) | state.json |

## What the Dashboard Does NOT Do

- Does NOT require the LLM to generate HTML (the script is deterministic)
- Does NOT accumulate context (reads files, writes HTML, done)
- Does NOT run during agent execution (only between phases)
- Does NOT add dependencies (uses only Node.js fs and path modules)
- Does NOT slow down the pipeline (script runs in <100ms)

## Integration with Orchestrator

Add this to the orchestrator's phase completion checklist (in core.md's PHASE GATE ENFORCEMENT):

```
After updating state.json:
  Bash: node {skill-path}/orchestrator/scripts/generate-dashboard.js {project-path}
```

The user can open `pipeline/dashboard.html` in any browser at any time to see current status.