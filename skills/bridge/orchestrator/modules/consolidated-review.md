# Consolidated Cross-LLM Review Module

Orchestrates parallel cross-LLM code review using external LLM CLIs (Codex, Gemini)
alongside Claude's existing Phase 5 validators. Findings are compared and discrepancies
flagged. This module is ALWAYS optional -- BRIDGE runs identically without it.

**When to run:** Phase 5, as Step 5.1f -- AFTER Step 5.1d (Multi-Pass Code Review),
BEFORE Step 5.2 (Quality Score Calculation). Only activates when at least one external
LLM CLI is available (CODEX_CLI or GEMINI_CLI is "ready") OR the codex plugin is installed.

**Design rationale:** A single LLM reviewing its own output has blind spots. A second LLM
with different training data, architecture, and biases catches different classes of issues.
This is NOT about one LLM being "better" -- it is about coverage through diversity.

---

## Activation Condition

```
IF CODEX_PLUGIN == "ready" OR CODEX_CLI == "ready" OR GEMINI_CLI == "ready":
  CONSOLIDATED_REVIEW = "active"
ELSE:
  CONSOLIDATED_REVIEW = "skip"
  Log: "Cross-LLM review skipped -- no external LLM CLIs available"
```

If skip: orchestrator proceeds directly to Step 5.2 (Quality Score). No degradation message.

---

## Execution Strategy: Parallel Launch + Consolidation

### Phase 1: Parallel Launch (runs DURING Steps 5.1a-5.1d)

The orchestrator launches external LLM reviews at the START of Phase 5, before
spawning the first Claude validator. This maximizes parallelism -- Codex works
while Claude validators run their own checks.

```
# At the START of Phase 5 (in Pre-Phase section):
IF CONSOLIDATED_REVIEW == "active":

  # Option A: Codex plugin available (preferred -- richer output)
  IF CODEX_PLUGIN == "ready":
    Skill: codex:adversarial-review --background --base main
    Record CODEX_JOB_ID from output

  # Option B: Codex CLI available but plugin not installed
  ELIF CODEX_CLI == "ready":
    Skill: second-opinion  (auto-selects Codex)

  # Option C: Gemini CLI only
  ELIF GEMINI_CLI == "ready":
    Skill: second-opinion  (auto-selects Gemini)

  # Then proceed with Steps 5.1a through 5.1d as normal (unchanged)
```

### Phase 2: Collect Results (Step 5.1f)

After Step 5.1d completes and before Step 5.2:

```
IF CODEX_PLUGIN == "ready":
  # Poll for Codex completion
  Run: /codex:status
  IF status == "running":
    Run: /codex:status --wait --timeout-ms 300000
    Run: /codex:result
  ELIF status == "completed":
    Run: /codex:result
  ELIF status == "failed" OR timeout:
    Log: "[WARN] Codex review failed/timed out -- proceeding with Claude-only results"
    SET codex_findings = []

ELIF second-opinion was used:
  Collect second-opinion output from skill result
```

### Phase 3: Consolidation Algorithm

```
FOR each finding in external_llm_findings:
  IF finding matches a Claude finding (same file, same issue class):
    Tag as CROSS_LLM_CONFIRMED
    Boost confidence score for that finding
  ELIF finding is NEW (Claude did not flag it):
    Tag as CROSS_LLM_DISCREPANCY
    Severity: inherit from external LLM finding
    Action: REQUIRES human review (do NOT auto-fix)
  ELIF finding contradicts a Claude PASS:
    Tag as CROSS_LLM_CONTRADICTION
    Severity: HIGH (escalate to human)

FOR each finding in claude_findings:
  IF finding was NOT found by external LLM:
    Tag as CLAUDE_ONLY (informational -- do not downgrade)
    Note: "External LLM did not flag this -- may be Claude-specific concern"
```

**Matching heuristic:** Two findings match if they reference the same file AND
the same issue category (security, logic, style, performance). Exact line-match
is NOT required -- different LLMs describe locations differently.

---

## Fallback Chain

```
Primary:   Codex plugin (/codex:adversarial-review)
Fallback1: second-opinion skill (Codex CLI direct)
Fallback2: second-opinion skill (Gemini CLI)
Fallback3: Claude-only (skip Step 5.1f entirely)
```

Each level degrades silently. No error messages unless the user explicitly
requested cross-LLM review and it is unavailable.

---

## Timeout and Failure Handling

| Scenario | Behavior |
|----------|----------|
| Codex takes > 5 minutes | Log warning, proceed with Claude-only results |
| Codex API returns error (auth, rate limit) | Log error, set findings = [], proceed |
| Codex returns empty review | Log "Codex found no issues", tag as EXTERNAL_CLEAN |
| User has no OpenAI account | CODEX_CLI detection fails in Phase 0, never attempted |
| Network down during Codex call | Codex CLI handles timeout internally, BRIDGE gets empty result |
| Gemini rate limit (60 req/min) | second-opinion skill handles backoff internally |
| Both Codex and Gemini fail | Entire Step 5.1f is skipped. Pipeline identical to pre-integration |

---

## Output Format

Write to `pipeline/05f-consolidated-review.md`:

```markdown
# Consolidated Cross-LLM Review Report

**External LLM:** {Codex via plugin v1.0.2 | Codex via second-opinion | Gemini via second-opinion}
**Review scope:** branch diff vs main
**Timestamp:** {ISO timestamp}

## Cross-LLM Agreement (CONFIRMED)
{findings both Claude and external LLM flagged -- boosted confidence}

## Cross-LLM Discrepancies (REQUIRES REVIEW)
{findings external LLM found that Claude missed -- each tagged CROSS_LLM_DISCREPANCY}

## Cross-LLM Contradictions (ESCALATED)
{findings where external LLM contradicts a Claude PASS}

## Claude-Only Findings (INFORMATIONAL)
{findings Claude found that external LLM did not}

## External LLM Raw Output
{verbatim Codex/Gemini output for reference}

## Summary
- Confirmed findings: {N}
- Discrepancies: {N}
- Contradictions: {N}
- Claude-only: {N}
- Cross-LLM confidence modifier: {+0.05 | +0.02 | -0.05 | 0.00}
```

---

## Codex Stop Hook (Opt-In Only)

The Codex plugin includes a Stop hook that gates Claude output with Codex review.
This is DISABLED by default (`config.codex_review_gate = false`).

To enable: set `"codex_review_gate": true` in project config.

When enabled: every time Claude stops, the Codex Stop hook runs a review before
presenting output. This adds latency and consumes Codex tokens.

**WARNING:** Do NOT enable during rapid iteration (Phase 4 building). It creates
a pseudo-loop where every Claude output triggers a Codex review. Only enable
during Phase 5 final validation if the team wants maximum review coverage.

When disabled (default): the Stop hook script runs but exits immediately (no-op).

---

## Tool Pricing and Tier Awareness

| Tool | Free Tier | When Exhausted |
|------|-----------|----------------|
| Codex CLI | ChatGPT Free tier works (limited) | Falls back to Gemini CLI or Claude-only |
| Codex API | Pay-as-you-go per token | Falls back to Gemini CLI or Claude-only |
| Gemini CLI | 60 req/min via Google AI Studio | Falls back to Claude-only |

The orchestrator does NOT track token usage across sessions. If Codex or Gemini
returns an authentication or rate-limit error, treat as "failed" and fall through
the chain silently.

---

## What This Module Does NOT Do

- Does NOT replace any existing Claude validator (5.1a through 5.1d unchanged)
- Does NOT auto-fix any findings (all DISCREPANCY/CONTRADICTION require user approval)
- Does NOT create infinite review loops (Codex runs once, collects once)
- Does NOT block the pipeline if external LLMs are unavailable
- Does NOT persist Codex job state between sessions
