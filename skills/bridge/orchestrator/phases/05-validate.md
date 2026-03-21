# Phase 5: Validate and Deliver

Phase 5 runs THREE specialized validation agents sequentially, plus the pr-review-toolkit. ALL must approve.

## Pre-Phase: Skill Invocations

- `Skill: superpowers:verification-before-completion` → orchestrator verifies claims before presenting
- `Skill: static-analysis` (Trail of Bits) → deep SAST
- `Skill: supply-chain-risk-auditor` (Trail of Bits) → dependency audit
- `Skill: differential-review` (Trail of Bits) → code drift vs architecture plan
- If vulnerability found: `Skill: variant-analysis` (Trail of Bits) → search for same pattern everywhere

---

## Step 5.1a - Spawn Validator Agent (Requirements & Architecture)

Check if `validator` agent exists. Spawn accordingly.

**Agent description**: `[Phase 5] Validator — Validating requirements coverage and architecture compliance`
(On re-validation: `[Phase 5] Validator — Re-validating after fixes`)

**Context-by-reference:**
```
## Context Files (read these — do NOT have orchestrator paste inline)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Plan Check: {project-path}/pipeline/03b-plan-check.md (if exists)
- All code: {project-path}/src/
- All tests: {project-path}/tests/
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)
```

### Validator Checks (Goal-Backward Verification)

Starting from business goal (BRIDGE B), work backward:
1. What conditions must be TRUE for the goal to be met?
2. For each condition: does the code make it true?
3. For each piece of code: is it **substantive** (not a stub)? Is it **wired** (connected)?

**Stub detection** (auto-flag):
- Empty function bodies, `return null`/`return []`
- `TODO`, `FIXME`, `HACK` in production code
- Components that render but don't connect to data
- API routes that exist but don't call the database

**Standard Checks:**
- BRIDGE alignment: addresses root causes (R), moves impact metrics (I), respects D-validated constraints
- Locked constraints: every one satisfied (no exceptions)
- Requirements coverage (REQ-XXX → implementation mapping)
- Architecture compliance (file manifest match)
- Run ALL test suites via Bash

**Posture:** Default to REJECT. Require evidence for every PASS claim.

**Output:** `pipeline/05-validation-report.md` with APPROVE/REJECT verdict.

---

## Step 5.1b - Spawn Code Reviewer Agent

**Agent description**: `[Phase 5] Code Reviewer — Reviewing code quality and test coverage`

Spawn `code-reviewer` agent (or `general-purpose` if not yet created).

### Code Reviewer Checks:
- Clean code: naming, structure, SRP
- Error handling at system boundaries (user input, external APIs)
- No over-engineering (YAGNI)
- Test quality: meaningful tests, edge cases covered, no `assert(true)`
- Documentation completeness
- Run eslint: `eslint . --format json`

**Output:** `pipeline/05a-code-review.md` with PASS/FAIL and file:line references.

---

## Step 5.1c - Spawn Security Auditor Agent (BLOCKING)

**Agent description**: `[Phase 5] Security Auditor — Running mandatory security scans`

Spawn `security-auditor` agent (or `general-purpose` if not yet created).

### Security Auditor Checks (ALL MANDATORY):

```bash
# 1. SAST scan
semgrep scan --config auto --json clients/{c}/{p}/src/ 2>/dev/null

# 2. Secrets detection
# Use gitguardian MCP if available, else grep for patterns
grep -rn "AKIA\|sk-\|password\s*=\s*['\"]" clients/{c}/{p}/src/ 2>/dev/null

# 3. Dependency audit
cd clients/{c}/{p} && npm audit --json 2>/dev/null || pip-audit --format json 2>/dev/null
```

- OWASP Top 10 review on all endpoints
- Hardcoded credentials check
- Insecure defaults review

**Output:** `pipeline/05c-security-audit.md` with SECURE/BLOCKED verdict.

### Security Gate (BLOCKING — read config.security_gate)

If `config.security_gate` is `"blocking"` (default):
- ANY CRITICAL finding = BLOCKED (stronger than REJECT)
- User sees: "Security gate BLOCKED delivery. {N} critical findings."
- Options:
  a) **Auto-fix** — re-spawn responsible specialist with security feedback
  b) **Manual fix** — user provides guidance
  c) **Accept risk** — user must type "I accept the risk for: {finding}" per finding
  d) **Abort delivery**
- Option (c) is intentionally friction-heavy

If `config.security_gate` is `"advisory"`:
- Findings are logged but do not block. User was warned.

---

## Step 5.1d - Multi-Pass Code Review (pr-review-toolkit)

**Invoke via Skill tool:** `pr-review-toolkit:review-pr all`

Dispatches 6 specialized review agents:
1. **code-reviewer** — Guidelines compliance, bug detection
2. **pr-test-analyzer** — Test coverage quality
3. **silent-failure-hunter** — Empty catches, missing error logging
4. **type-design-analyzer** — Type encapsulation
5. **comment-analyzer** — Comment accuracy
6. **code-simplifier** — Simplification opportunities

**Aggregate with previous results:**
- Critical issues override Validator APPROVE → REJECT
- Output: `pipeline/05b-pr-review.md`

### Optional: GitHub PR Review
If project has GitHub repo AND PR exists:
```
Skill: code-review:code-review
Args: {PR number}
```
Non-blocking. Skip if no PR or `gh` not authenticated.

### Optional: Mutation Testing (if config.workflow.mutation_testing)
```bash
npx stryker run --mutate "src/core/**/*.{ts,js}" --reporters clear-text,json 2>/dev/null
```
- Score > 80%: strong tests
- Score 60-80%: WARNING
- Score < 60%: CRITICAL

---

## Step 5.2 - Quality Score Calculation

Compute composite quality_score:

```
quality_score = (requirements_coverage * 0.35) + (test_pass_rate * 0.25) +
                (security_score * 0.20) + (code_quality * 0.10) +
                (documentation_completeness * 0.10)
```

Write to `pipeline/quality-score.json`:
```json
{
  "score": 0.87,
  "breakdown": { ... },
  "threshold": 0.80,
  "decision": "APPROVE",
  "timestamp": "2026-03-21T..."
}
```

- score >= 0.80: APPROVE
- score 0.60-0.79: CONDITIONAL APPROVE
- score < 0.60: REJECT

---

## Step 5.3 - Rejection Loop

If REJECT: present via AskUserQuestion with structured feedback routing.

Write routing to `pipeline/feedback-routing.json`:
```json
{
  "routes": [
    {"target_phase": 4, "target_agent": "spec-X", "issue": "...", "severity": "HIGH"}
  ]
}
```

Options:
- **Auto-fix** — re-spawn responsible agent with feedback
- **Manual instructions** — user provides fix guidance
- **Override approve** — accept with documented exceptions
- **Stop and deliver as-is** — deliverables with known issues documented
- **Abort**

Max 3 fix attempts. Log to `pipeline/improvements.tsv`.

**Max pivot rules:**
- Phase 4 rejection: max 3 attempts per slice, then escalate
- Phase 5 rejection: max 2 cycles before user override option
- Same issue_type appears 2+ times as not_fixed: escalate immediately

---

## Step 5.4 - HUMAN APPROVAL GATE (Final)

**CHECKPOINT:** Glob for ALL required Phase 5 artifacts:
- `pipeline/05-validation-report.md` (MANDATORY)
- `pipeline/05b-pr-review.md` (MANDATORY)
- `pipeline/05c-security-audit.md` (MANDATORY)

Present combined validation summary.

Options:
- **Approve and generate deliverables**
- **Request additional changes**
- **Run additional tests**

---

## Step 5.5 - Generate Full Deliverables

Read `modules/deliverable-generation.md` for full deliverable generation protocol.
Generate BOTH internal and client deliverables.

---

## Step 5.6 - Cross-Run Lesson Capture

Read `pipeline/improvements.tsv`. For each issue requiring 2+ attempts:

Write lesson to `pipeline/lessons/lesson-{slug}.md`:
```markdown
# Lesson: {short title}
**Date:** {YYYY-MM-DD}
**Context:** {what was being built}
**Issue:** {what went wrong}
**What didn't work:** {failed attempts}
**What worked:** {solution or recommendation}
**Apply when:** {relevance condition}
```

Max 5 new lessons per run. Keep short (<100 words) and specific.

---

## Step 5.7 - Update Client Knowledge Graph

Read `modules/client-knowledge-graph.md`. After successful validation:
- Update `clients/{client-slug}/.knowledge/graph.json` with:
  - Technology decisions from this project
  - Constraints discovered
  - Anti-patterns encountered
  - Successful patterns

---

## Step 5.7b - Final Integration Checklist

Before presenting final summary: `Skill: superpowers:finishing-a-development-branch` → follow integration checklist (tests green, no debug code, docs updated, clean history).

---

## Step 5.8 - FINAL SUMMARY

Present: project folder, all deliverables (internal + client), agents used, knowledge updates, cost summary.
Mark all todos complete.
Archive successful specialists (Step 4.7).
