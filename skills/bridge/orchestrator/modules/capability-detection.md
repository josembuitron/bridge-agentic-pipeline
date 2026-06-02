# Capability Detection — Advanced Orchestration

<!--
  BRIDGE Development Pipeline
  Architecture and orchestration designed by Jose Milton Buitron
  https://github.com/josembuitron/bridge-agentic-pipeline
-->

## Why this module exists

BRIDGE can run faster and produce more trustworthy results when it borrows two native
Claude Code capabilities: **Dynamic Workflows** (a script the runtime executes in the
background, holding the orchestration loop OUTSIDE the conversation's context window) and
the **adversarial debate** pattern popularized by Agent Teams (independent workers that
challenge each other's findings instead of one pass that anchors on the first plausible
answer).

Both are valuable, but they are moving targets. Dynamic Workflows is a *research preview*
and Agent Teams is *experimental and disabled by default*. Either could change behavior,
get gated behind a flag, or disappear between Claude Code versions. We refuse to make the
pipeline's correctness depend on a feature that might not be there.

The contract this module enforces is simple: **prefer the better engine when it is really
available, and fall back to the stable engine silently when it is not — every single run,
freshly detected.** The user keeps these features ON by default (see
`references/config-schema.json` → `advanced_orchestration`), and capability detection is
what makes "ON by default" safe. If the capability vanishes, BRIDGE turns it off by itself.

## Preference vs. capability — the core idea

Two independent things decide whether an advanced path is used:

| Layer | Source of truth | Meaning |
|---|---|---|
| **Preference** | `config.advanced_orchestration.*.enabled` (default `true`) | What the user WANTS |
| **Capability** | `pipeline/capabilities.json` (computed here) | What the running Claude Code CAN do |

**Effective state = preference AND capability.** A feature runs only when the user left it
enabled AND detection proved it is available. This is why the defaults can be ON without
risk: a missing capability flips the effective state to OFF and the classic path takes over.

## When detection runs

- **Phase 0, Step 0.0c** (right after Tool & Resource Discovery, before any phase work).
  Detection is per-project and per-run, so a downgraded Claude Code or a removed preview
  feature is noticed on the very next pipeline run — no stale assumptions carry over.
- **On any mid-run failure** of an advanced path: mark that capability `available: false`
  for the remainder of the run, record the reason, and fall back. Never retry an advanced
  path that already failed once in the same run.

## What to detect and how

Run these checks with Bash (or PowerShell on Windows). All are best-effort and must never
block the pipeline — if a probe itself errors, treat the capability as unavailable.

### 1. Claude Code version
```
claude --version
```
Parse the semver. Several features have minimum versions (below). If `claude` is not on the
PATH (e.g., running inside an SDK host), skip version-gated probes and rely on the env/flag
checks plus the safe defaults in the table.

### 2. Dynamic Workflows
Available when ALL of the following hold:
- Claude Code version >= **2.1.154**, AND
- `disableWorkflows` is not `true` in `~/.claude/settings.json` (and not in project
  `.claude/settings.json` or managed settings), AND
- env `CLAUDE_CODE_DISABLE_WORKFLOWS` is not `1`.

Best-effort confirmation signals (use if cheap, do not hard-require):
- The bundled `/deep-research` command is listed in available skills/commands.
- A `~/.claude/workflows/` or `.claude/workflows/` directory exists (saved workflows).

### 3. Agent Teams (native)
Available when ALL of the following hold:
- Claude Code version >= **2.1.32**, AND
- env `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` == `1` (or set in `settings.json` `env`), AND
- a usable display mode exists for the platform.

Platform note (decisive on this user's stack): split-pane mode needs **tmux or iTerm2** and
is explicitly unsupported in VS Code's integrated terminal, Windows Terminal, and Ghostty.
In-process mode works everywhere but **does not survive `/resume` or `/rewind`** — which
directly conflicts with BRIDGE's cross-session resumability. Therefore, even when native
Agent Teams is "available", BRIDGE does NOT use it for the pipeline spine. It is recorded
for completeness and only selected for the adversarial-debate engine when the user has
explicitly set `agent_teams.prefer_when_available: true` AND a split-pane mode is present.
See `modules/adversarial-debate.md` for the rationale (resumability, per-client isolation,
per-agent skill routing, nested-team limits).

## Output — `pipeline/capabilities.json`

Write this once detection completes (Strict Write Discipline applies: write, Glob-verify,
then reference it). For Phase 0 before `pipeline/` exists, write to
`/tmp/bridge-capabilities-{session}.json` and move it into `pipeline/` once Step 0.3 creates
the directory.

```json
{
  "detected_at": "2026-06-02T00:00:00Z",
  "claude_code_version": "2.1.160",
  "dynamic_workflows": {
    "available": true,
    "reason": "version 2.1.160 >= 2.1.154; not disabled in settings or env",
    "min_version": "2.1.154"
  },
  "agent_teams_native": {
    "available": false,
    "reason": "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS not set; split-pane unsupported in VS Code terminal",
    "min_version": "2.1.32"
  },
  "adversarial_debate": {
    "available": true,
    "engine": "subagents",
    "reason": "subagent engine is always available; native teams not selected (see module)"
  }
}
```

`adversarial_debate.engine` resolution:
- `subagents` whenever `agent_teams_native.available` is false, OR
  `config.advanced_orchestration.agent_teams.prefer_when_available` is false (the default).
- `agent_teams` only when native is available AND the user opted in AND a split-pane mode
  exists. On this user's Windows + VS Code stack this branch is not taken.

## Graceful degradation — the non-negotiable rule

For every advanced path there is a stable classic path that produces the same canonical
artifact at the same location, so the gated pipeline never notices which engine ran:

| Capability | Advanced engine | Stable fallback | Canonical artifact (unchanged) |
|---|---|---|---|
| Dynamic Workflows (research) | `/deep-research`-style workflow | classic Researcher agent | `pipeline/02-research-report.md` |
| Dynamic Workflows (consolidated review) | review workflow | background consolidated review | `pipeline/05-validation-report.md` + reviews |
| Dynamic Workflows (large codebase) | audit workflow | classic Codebase Analyzer | `pipeline/00b-codebase-analysis.md` |
| Adversarial debate | native Agent Teams | independent subagents (file-bridged) | `pipeline/{NN}d-adversarial-debate.md` |

If `capabilities.json` is missing or unreadable at any decision point, assume EVERYTHING is
unavailable and use the classic path. Absence of evidence is treated as absence of the
capability — the pipeline always works on a stock Claude Code with no preview features.

## What detection must never do

- Never block, prompt, or fail the pipeline because an advanced feature is missing.
- Never enable a feature the user disabled in config, even if detection says it is available.
- Never assume a capability persists across runs — re-detect every Phase 0.
- Never route a human approval gate or any state-changing write through an engine that
  cannot guarantee it (workflows have no mid-run user input — see `workflow-delegation.md`).

## Security posture (per references/security-checklist.md change review)

- No new external service, MCP, or installable dependency is introduced. These are native
  Claude Code surfaces, so no new pinned tool and no new taint source.
- Agents spawned by a workflow or a debate still receive the `prompt-defense-baseline.md`
  block and the taint protocol; research still flows through the already-tracked taint
  sources (WebFetch, crawl4ai, Playwright).
- The Zero Assumptions Rule is unaffected: delegation changes WHO runs a sub-task, not the
  gates or the constraint-locking discipline.
- AI-SAFE2 pillar touched: Engineering (orchestration). No change to Data, Governance, or
  the security gate, which remains BLOCKING.
