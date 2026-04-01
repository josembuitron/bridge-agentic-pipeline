# External Issue Tracker Integration (Optional)

## Configuration

Set in `pipeline/config.json`:
```json
{
  "issue_tracker": {
    "type": "none",
    "repo": null,
    "project_key": null,
    "auto_create": false
  }
}
```

Supported types: `"none"` | `"github"` | `"jira"` | `"linear"`

When `"none"` (default): no integration. The internal `pipeline/` folder IS the tracking mechanism. The pipeline works 100% without an external tracker.

---

## GitHub Issues (via `gh` CLI — already available)

### Setup
```json
{
  "issue_tracker": {
    "type": "github",
    "repo": "org/repo",
    "auto_create": true
  }
}
```

### Integration Points

**Phase 0 (Initialization):**
```bash
# Create project tracking issue
gh issue create --repo {repo} \
  --title "BRIDGE: {project-name}" \
  --body "Project: {client}/{project}\nPhases: 0/5\nStatus: Initialized" \
  --label "bridge-project"
```

**Phase 1-3 (each approval gate):**
```bash
# Update tracking issue with phase completion
gh issue comment {issue-number} --repo {repo} \
  --body "[ok] Phase {N} ({phase-name}) approved.\nKey decisions: {summary}"
```

**Phase 4 (per specialist):**
```bash
# Create sub-issue per specialist
gh issue create --repo {repo} \
  --title "BRIDGE: {project} — {specialist-name}" \
  --body "Specialist: {role}\nSlices: {count}\nStatus: Building" \
  --label "bridge-specialist"
```

**Phase 5 (validation):**
```bash
# On APPROVE: close all issues
gh issue close {issue-number} --repo {repo} --comment "[ok] Validated and delivered"

# On REJECT: add comment with findings
gh issue comment {issue-number} --repo {repo} \
  --body "[FAIL] Validation rejected.\nIssues: {summary}\nRouted to: {agent}"
```

---

## Jira (via REST API)

### Setup
```json
{
  "issue_tracker": {
    "type": "jira",
    "project_key": "PROJ",
    "auto_create": true
  }
}
```

Requires: `JIRA_URL` and `JIRA_TOKEN` environment variables.

### Integration Points

```bash
# Create issue
curl -s -X POST "${JIRA_URL}/rest/api/2/issue" \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "{project_key}"},
      "summary": "BRIDGE: {project-name}",
      "issuetype": {"name": "Task"}
    }
  }'
```

Similar pattern for updates, sub-tasks, and transitions.

---

## Linear (via GraphQL API)

### Setup
```json
{
  "issue_tracker": {
    "type": "linear",
    "auto_create": true
  }
}
```

Requires: `LINEAR_API_KEY` environment variable.

---

## Integration Rules

1. **Never block the pipeline** on issue tracker failures. If API call fails, log and continue.
2. **Issue creation is idempotent** — check if issue exists before creating.
3. **All issue content is internal** — use agent names, phase numbers, technical details.
4. **Client deliverables never reference issue tracker** — that's internal tooling.
5. When `auto_create` is `false`: the orchestrator informs the user what to create manually.
