# Health Check Module

On-demand pipeline and project health diagnostics. Replaces the concept of a background daemon with explicit, user-triggered checks.

**Trigger:** `/bridge health` or `/bridge health {client}/{project}`

---

## When to Run

- **Explicitly:** User invokes `/bridge health`
- **Automatically at Phase 0:** A lightweight subset (checks 1-2 only) runs during initialization for returning projects
- **Never automatically** between sessions -- this is NOT a daemon

---

## Health Checks

### Check 1: State Coherence (ALWAYS runs at Phase 0 for returning projects)

Verify that `pipeline/state.json` matches actual files on disk.

```
For each phase in state.json.completed_phases:
  Expected artifact = pipeline/0{N}-*.md
  Glob for artifact → exists?
  IF missing: WARN "state.json says Phase {N} complete but artifact missing"
```

**Auto-fix:** If state.json claims phases that have no artifacts, correct state.json and inform user.

### Check 2: Knowledge Graph Freshness (runs at Phase 0 for returning clients)

```
Read clients/{client}/.knowledge/graph.json
IF last_updated > 30 days: SUGGEST "/bridge dream {client}"
IF projects_completed.length >= 3 AND no .knowledge/archive/: SUGGEST first dream
```

This check is already specified in Phase 0.3b but this module provides the canonical implementation.

### Check 3: Dependency Health (on-demand only)

```bash
# Check for known vulnerabilities in project dependencies
if [ -f "package.json" ] || [ -f "package-lock.json" ]; then
  npm audit --json 2>/dev/null | head -50
fi

if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  pip audit --format=json 2>/dev/null | head -50
fi
```

Report: `{N} vulnerabilities found ({critical}/{high}/{medium}/{low})`

### Check 4: Test Suite Health (on-demand only)

```bash
# Run existing tests without modification
if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
  npx vitest run --reporter=json 2>/dev/null | tail -20
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  pytest --tb=no -q 2>/dev/null | tail -10
fi
```

Report: `{passed}/{total} tests passing, {failed} failures`

### Check 5: Documentation Drift (on-demand only)

Compare README references against actual file structure:
```
Grep README.md for file paths → Glob each path → report missing
Grep for API endpoints mentioned → Grep src/ for actual endpoints → report mismatches
```

Report: `{N} stale references found in documentation`

---

## Output Format

```markdown
## BRIDGE Health Check -- {client}/{project}

**Date:** {YYYY-MM-DD HH:MM}
**Pipeline status:** {from state.json}
**Current phase:** {N}

### Results
| Check | Status | Details |
|-------|--------|---------|
| State coherence | PASS/WARN | {details} |
| Knowledge freshness | PASS/SUGGEST | {details} |
| Dependencies | PASS/WARN/{N} vulns | {details} |
| Test suite | PASS/{N} failures | {details} |
| Documentation | PASS/{N} stale refs | {details} |

### Recommended Actions
1. {action if any checks failed}
```

---

## Integration with Phase 0

Add to Step 0.3b (after knowledge graph loading):

```
IF this is a returning project (state.json exists):
  Run Check 1 (state coherence) -- auto-fix if needed
  Run Check 2 (knowledge freshness) -- suggest dream if needed
  Report results before continuing
```

These two checks are lightweight (2-3 Glob/Read operations) and prevent starting work on a corrupted or stale project.

---

## NOT a Daemon

This module explicitly does NOT:
- Run in the background
- Use `/loop` for periodic execution
- Monitor files between sessions
- Send notifications

**Why:** BRIDGE is a pipeline tool, not a monitoring service. Health checks are most valuable at the moment you're about to do work (Phase 0) or when you suspect something is wrong (`/bridge health`). A daemon adds complexity for marginal value.
