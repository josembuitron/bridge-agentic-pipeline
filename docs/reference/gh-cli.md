---
name: gh-cli
description: GitHub CLI operations -- use for any GitHub task: creating/pushing repos, managing PRs, issues, releases, workflow runs, auth, and repo sync. Trigger on: "push to GitHub", "create PR", "open issue", "sync repo", "create release", "check workflow", "gh auth", any GitHub repository operations.
---

# GitHub CLI (gh) Skill

Use `gh` for all GitHub operations. It is installed at `~/.local/bin/gh`. Always prefer `gh` over raw `git` for GitHub-specific tasks.

## First-time Setup

```bash
# Authenticate (opens browser or prompts for token)
gh auth login

# Verify auth
gh auth status
```

## Repository Operations

```bash
# Create a new repo and push current directory
gh repo create <name> --private --source=. --remote=origin --push

# Create repo without pushing
gh repo create <name> --private --description "description"

# Clone a repo
gh repo clone <owner>/<repo>

# Fork a repo
gh repo fork <owner>/<repo> --clone

# View repo info
gh repo view [<owner>/<repo>]

# Set repo description/topics
gh repo edit --description "text" --add-topic "topic1"

# List your repos
gh repo list [--limit 50]
```

## Workflow: New Repo from Local Folder

```bash
cd /path/to/folder
git init
git add .
git commit -m "initial commit"
gh repo create <repo-name> --private --source=. --remote=origin --push
```

## Pull Requests

```bash
# Create PR (opens editor for body)
gh pr create --title "Title" --body "Description"

# Create PR with full body inline
gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- change 1

## Test plan
- [ ] tested locally
EOF
)"

# Create PR targeting a specific base branch
gh pr create --base main --title "Title" --body "..."

# List PRs
gh pr list [--state open|closed|merged]

# View PR
gh pr view [<number>]

# Merge PR
gh pr merge <number> --merge|--squash|--rebase

# Review PR
gh pr review <number> --approve
gh pr review <number> --request-changes --body "feedback"

# Check PR status / CI checks
gh pr checks <number>
```

## Issues

```bash
# Create issue
gh issue create --title "Title" --body "Description" [--label "bug"]

# List issues
gh issue list [--state open|closed] [--label "bug"]

# View issue
gh issue view <number>

# Close issue
gh issue close <number> [--comment "Resolved in PR #X"]

# Reference issue in commit: "fixes #123" or "closes #123"
```

## Releases

```bash
# Create release from tag
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"

# Create release with generated notes
gh release create v1.0.0 --generate-notes

# Upload assets to release
gh release upload v1.0.0 ./dist/app.zip

# List releases
gh release list

# View release
gh release view v1.0.0
```

## GitHub Actions / Workflows

```bash
# List workflows
gh workflow list

# Run a workflow manually
gh workflow run <workflow-name-or-id> [--field key=value]

# List recent workflow runs
gh run list [--workflow <name>] [--limit 10]

# View a run's status and logs
gh run view <run-id>
gh run view <run-id> --log

# Watch a run in real time
gh run watch <run-id>
```

## Sync / Maintenance

```bash
# Sync a fork with upstream
gh repo sync

# Set upstream remote
gh repo set-default <owner>/<repo>

# List collaborators
gh api repos/<owner>/<repo>/collaborators

# Add secret to repo
gh secret set MY_SECRET --body "value"
gh secret list
```

## Common Patterns

### Full push + PR workflow
```bash
git add <files>
git commit -m "feat: description"
git push -u origin <branch>
gh pr create --title "feat: description" --body "Summary of changes"
```

### Create private repo and push existing project
```bash
cd /path/to/project
git init && git add . && git commit -m "initial commit"
gh repo create <name> --private --source=. --remote=origin --push
```

### Check if gh is authenticated
```bash
gh auth status 2>&1 | grep -q "Logged in" && echo "authenticated" || echo "not authenticated"
```

## Flags Reference

| Flag | Meaning |
|------|---------|
| `--private` | Private repository |
| `--public` | Public repository |
| `--source=.` | Use current directory as source |
| `--remote=origin` | Set as origin remote |
| `--push` | Push immediately after creating |
| `--generate-notes` | Auto-generate release notes from PRs |
| `--squash` / `--merge` / `--rebase` | Merge strategy |

## Notes

- `gh` uses your GitHub credentials from `gh auth login`
- Token scopes needed: `repo`, `workflow`, `read:org`
- For enterprise: `gh auth login --hostname <enterprise-hostname>`
- PATH: `~/.local/bin/gh` (already configured)
