# Pipeline Rollback via Git Tags

Enables "go back to Phase N" by snapshotting pipeline state after each phase approval.

## After Each Phase Approval

The orchestrator creates a git tag:

```bash
# Stage pipeline artifacts (paths quoted for safety)
git add "clients/${c}/${p}/pipeline/"

# Commit with descriptive message
git commit -m "bridge: Phase ${N} approved - ${phase_name} [clients/${c}/${p}]"

# Tag for rollback
git tag "bridge/${c}/${p}/phase-${N}"
```

## Rollback Command

When user says "go back to Phase 2" or "undo Phase 3":

### Step 1: List available snapshots
```bash
git tag -l "bridge/{c}/{p}/*" --sort=-creatordate
```

### Step 2: Show options
```
Available snapshots:
  - bridge/{c}/{p}/phase-1 (2026-03-21 14:30)
  - bridge/{c}/{p}/phase-2 (2026-03-21 15:15)
  - bridge/{c}/{p}/phase-3 (2026-03-21 16:00) ← current

Roll back to Phase 2? This will:
  - Restore pipeline/ to its state after Phase 2
  - Remove Phase 3 artifacts (03-solution-proposal.md, etc.)
  - You can re-run Phase 3 from here

Proceed?
```

### Step 3: Execute rollback
```bash
# Restore pipeline folder to tagged state
git checkout "bridge/{c}/{p}/phase-{N}" -- clients/{c}/{p}/pipeline/

# Remove later pipeline files (safety: list them first)
rm -f clients/{c}/{p}/pipeline/0{N+1}*.md
rm -f clients/{c}/{p}/pipeline/0{N+2}*.md
# etc.
```

### Step 4: Resume
The orchestrator resumes from Phase N+1, reading the restored pipeline/ state.

## Safety Rules

- Tags are **local only** — never pushed unless user explicitly asks
- Only `pipeline/` folder is tagged — `src/` has its own git history
- User can always "override approve" to skip rollback confirmation
- Before destructive rollback, ALWAYS list what will be removed and ask for confirmation
- Rollback does NOT affect the client knowledge graph (that's cumulative)

## Tag Naming Convention

```
bridge/{client-slug}/{project-slug}/phase-{N}
```

Examples:
- `bridge/acme-corp/netsuite-migration/phase-1`
- `bridge/acme-corp/netsuite-migration/phase-3`
- `bridge/internal/etl-pipeline-v2/phase-5`

## Cleanup

Tags accumulate across runs. To clean up old tags:
```bash
# List all bridge tags
git tag -l "bridge/*"

# Delete tags for a completed project
git tag -l "bridge/{c}/{p}/*" | xargs git tag -d
```

The orchestrator does NOT auto-cleanup. User decides when to clean.
