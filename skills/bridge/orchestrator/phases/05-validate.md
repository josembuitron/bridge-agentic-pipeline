# Phase 5: Validate and Deliver

Phase 5 runs FOUR specialized validation agents sequentially, plus the pr-review-toolkit. ALL must approve.

## Pre-Phase: Skill Invocations

- `Skill: superpowers:verification-before-completion` → orchestrator verifies claims before presenting
- `Skill: static-analysis` (Trail of Bits) → deep SAST (CodeQL + Semgrep + SARIF)
- `Skill: supply-chain-risk-auditor` (Trail of Bits) → dependency audit (CVEs, typosquatting, malicious packages)
- `Skill: differential-review` (Trail of Bits) → code drift vs architecture plan
- `Skill: spec-to-code-compliance` (Trail of Bits) → verify final code implements spec with evidence-based alignment
- `Skill: audit-context-building` (Trail of Bits) → ultra-granular analysis of final codebase (modules, actors, storage, cross-function flows)
- `Skill: fp-check` (Trail of Bits) → systematic false positive verification gate for all security findings
- If vulnerability found: `Skill: variant-analysis` (Trail of Bits) → search for same pattern everywhere
- If vulnerability found: `Skill: semgrep-rule-creator` (Trail of Bits) → create custom Semgrep rule for the project-specific pattern
- If multi-language project + custom rule created: `Skill: semgrep-rule-variant-creator` (Trail of Bits) → port rule to each project language
- If project has GitHub Actions CI/CD: `Skill: agentic-actions-auditor` (Trail of Bits) → audit for AI agent workflow vulnerabilities
- If code handles crypto/secrets in memory: `Skill: zeroize-audit` (Trail of Bits) → detect missing zeroization of sensitive data
- If code has timing-sensitive crypto: `Skill: constant-time-analysis` (Trail of Bits) → detect compiler-induced timing side-channels
- If project is blockchain/smart contracts: `Skill: building-secure-contracts` (Trail of Bits) → platform-specific vulnerability detection
- If project is Android+Firebase: `Skill: firebase-apk-scanner` (Trail of Bits) → scan for Firebase misconfigurations
- If external LLM CLIs available (Codex, Gemini): `Skill: second-opinion` (Trail of Bits) → independent code review with different model

---

## Step 5.1a - Spawn Validator Agent (Requirements & Architecture)

Check if `validator` agent exists. Spawn accordingly.

**Agent description**: `[Phase 5] Validator -- Validating requirements coverage and architecture compliance`
(On re-validation: `[Phase 5] Validator -- Re-validating after fixes`)

**Context-by-reference:**
```
## Context Files (read these -- do NOT have orchestrator paste inline)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Plan Check: {project-path}/pipeline/03b-plan-check.md (if exists)
- Research Report: {project-path}/pipeline/02-research-report.md (focus on Security & Taint Assessment section -- if exists)
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

**Doc-Architecture Sync Checks (Harness Engineering):**
- Every component in `03-solution-proposal.md` has corresponding implementation in `src/`
- Every API endpoint documented has a corresponding route/handler
- Environment variables documented in README or `.env.example` are actually used (and vice versa)
- Mermaid diagrams in architecture docs match actual module structure (component names exist as files/directories)
- If Phase 2 Security & Taint Assessment exists: verify HIGH-risk integrations have guardrails implemented per Section H of the solution proposal
- Flag mismatches as: `DOC_DRIFT: {doc} says X, code does Y`

**REVIEW.md Support:** If `{project-path}/REVIEW.md` exists, read it and apply its rules as additional validation criteria. REVIEW.md contains project-specific review guidelines (e.g., "every API route must have an integration test", "no raw SQL queries"). Violations are reported as nit-level findings. If no REVIEW.md exists, skip this check silently.

**Posture:** Default to REJECT. Require evidence for every PASS claim.

**Anti-Praise Guard (from Anthropic's Harness Design research):**
Anthropic's research found that "evaluators identify legitimate issues but talk themselves into
approving mediocre work anyway." You will feel the urge to do this. Recognize these patterns:

| Your instinct | The truth |
|---|---|
| "Overall the implementation looks solid" | Did you RUN it? "Looks solid" is not evidence. |
| "Minor issues but nothing blocking" | List every issue. Let the orchestrator decide severity. |
| "The architecture is well-structured" | Does it match the Solution Proposal? Check file-by-file. |
| "Tests provide good coverage" | What is the ACTUAL coverage %? Did you check edge cases? |
| "Requirements are mostly addressed" | "Mostly" = some are NOT. List which ones are missing. |

**If you catch yourself writing praise before evidence, STOP. Write the evidence first, then conclude.**

**Concrete Evaluation Rubric (from Anthropic's GAN-inspired design):**
Score each dimension 1-5. Do NOT assign scores without evidence.

| Dimension | Weight | 1 (Fail) | 3 (Acceptable) | 5 (Excellent) |
|---|---|---|---|---|
| **Requirements Coverage** | 35% | >20% REQs unimplemented or stubbed | All critical REQs implemented, <10% minor gaps | 100% REQs implemented with edge cases |
| **Architecture Compliance** | 20% | Major deviations from Solution Proposal | File structure matches, minor drift | Exact match with documented architecture |
| **Functional Correctness** | 25% | Core features broken or stubbed | Happy paths work, some edge cases fail | All paths work including error handling |
| **Test Quality** | 10% | No tests or only `assert(true)` | Tests exist for main flows | TDD evidence, edge cases, boundary tests |
| **Documentation Sync** | 10% | Docs contradict implementation | Docs mostly current | Docs match code, no DOC_DRIFT |

**Score = weighted sum. Threshold: 3.0 = APPROVE, 2.0-2.99 = CONDITIONAL, <2.0 = REJECT.**
Include the rubric scores in the validation report alongside the existing quality_score.

**Slice Contract Verification:** If `pipeline/04-slice-*-contract.md` files exist, verify EACH done criterion in each contract. Every criterion is TRUE or FALSE -- no "partially met."

**Meta-instruction:** Own validation work as evidence-driven quality and risk reduction, not checklist theater. Prioritize the smallest actionable findings that reduce user-visible failure risk.

**Return Contract (MANDATORY):** Your final report MUST include these 5 sections:
1. **SCOPE**: Exact files/components/endpoints analyzed
2. **FINDINGS**: Each with severity + supporting evidence (quote code, show output)
3. **FIXES**: Smallest recommended fix per finding + expected risk reduction
4. **VALIDATED vs. UNVERIFIED**: What you confirmed vs. what needs runtime/environment verification
5. **VERDICT**: APPROVE / REJECT / CONDITIONAL (with conditions listed)

**Stubs Export (MANDATORY):** After completing all checks, write detected stubs to `pipeline/05-stubs-detected.json`:
```json
{
  "stubs": [
    { "file": "src/auth.ts", "line": 42, "type": "empty_function", "description": "login() returns null" },
    { "file": "src/api/users.ts", "line": 15, "type": "todo", "description": "TODO: implement validation" }
  ],
  "total_stubs": 2,
  "timestamp": "2026-03-24T..."
}
```
This file is consumed by Code Reviewer (5.1b) and Security Auditor (5.1c) to exclude stubs from their analysis. Without this, they may give false positives on code that doesn't exist yet.

**Output:** `pipeline/05-validation-report.md` with APPROVE/REJECT verdict + `pipeline/05-stubs-detected.json`.

---

## Step 5.1b - Spawn Code Reviewer Agent

**Agent description**: `[Phase 5] Code Reviewer -- Reviewing code quality and test coverage`

Spawn `code-reviewer` agent (or `general-purpose` if not yet created).

**Stub Awareness:** Read `pipeline/05-stubs-detected.json` (if exists). Exclude listed files/functions from quality review -- they are known stubs flagged by Validator. Report them as `STUB_SKIPPED` instead of reviewing phantom code.

**Meta-instruction:** Own code review work as evidence-driven quality and risk reduction, not checklist theater.

**Anti-Praise Guard:** Same rules as Validator (5.1a). If you catch yourself writing "clean code" or "well-structured" before citing specific file:line evidence, STOP and provide the evidence first. Every PASS claim requires a supporting observation.

### Code Reviewer Checks:
- Clean code: naming, structure, SRP
- Error handling at system boundaries (user input, external APIs)
- No over-engineering (YAGNI)
- Test quality: meaningful tests, edge cases covered, no `assert(true)`
- Documentation completeness
- REVIEW.md compliance: if `{project-path}/REVIEW.md` exists, check code against its rules
- Run eslint: `eslint . --format json`

**Return Contract (MANDATORY):** Your final report MUST include these 5 sections:
1. **SCOPE**: Exact files/components analyzed
2. **FINDINGS**: Each with severity + supporting evidence (quote code at file:line)
3. **FIXES**: Smallest recommended fix per finding + expected risk reduction
4. **VALIDATED vs. UNVERIFIED**: What you checked vs. what needs deeper review
5. **VERDICT**: PASS / FAIL (with file:line references for each failure)

**Output:** `pipeline/05a-code-review.md`.

---

## Step 5.1e - Spawn Adversarial Verifier (CONDITIONAL)

**Activation check:** `ls {project-path}/src/*.* 2>/dev/null`

If no code in `src/`: skip with log "Adversarial Verifier skipped -- no src/ code". Proceed to Step 5.1c.

If code exists:
1. Read `modules/adversarial-verifier.md` for the full agent prompt and strategy
2. Spawn agent: `[Phase 5] Adversarial Verifier -- Trying to break the implementation`
3. Agent model: **opus** (high-stakes verification)
4. Parse `VERDICT:` line from output
5. If FAIL: route to rejection loop (Step 5.3) with adversarial findings
6. If PARTIAL: include unverified items in approval gate summary (Step 5.4)
7. If PASS: proceed to Step 5.1c

**Stub Awareness:** Read `pipeline/05-stubs-detected.json` (if exists). Do not attempt to execute stubs -- they are known incomplete code.

**Output:** `pipeline/05e-adversarial-verification.md`

---

## Step 5.1c - Spawn Security Auditor Agent (BLOCKING)

**Agent description**: `[Phase 5] Security Auditor -- Running mandatory security scans`

Spawn `security-auditor` agent (or `general-purpose` if not yet created).

**Stub Awareness:** Read `pipeline/05-stubs-detected.json` (if exists). Exclude listed files from security scanning -- scanning empty stubs produces false "SECURE" verdicts on code that doesn't exist. Report stubs as `STUB_GAP: {file} not scanned (stub)` instead.

**Meta-instruction:** Own security auditing work as evidence-driven quality and risk reduction, not checklist theater.

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

**Return Contract (MANDATORY):** Your final report MUST include these 5 sections:
1. **SCOPE**: Exact files/endpoints/dependencies scanned
2. **FINDINGS**: Each with severity + supporting evidence (tool output, code reference)
3. **FIXES**: Smallest recommended fix per finding + expected risk reduction
4. **VALIDATED vs. UNVERIFIED**: What was tool-verified vs. what needs manual pen-test
5. **VERDICT**: SECURE / BLOCKED (with critical finding count)

**Output:** `pipeline/05c-security-audit.md`.

### Security Gate (BLOCKING -- read config.security_gate)

If `config.security_gate` is `"blocking"` (default):
- ANY CRITICAL finding = BLOCKED (stronger than REJECT)
- User sees: "Security gate BLOCKED delivery. {N} critical findings."
- Options:
  a) **Auto-fix** -- re-spawn responsible specialist with security feedback
  b) **Manual fix** -- user provides guidance
  c) **Accept risk** -- user must type "I accept the risk for: {finding}" per finding
  d) **Abort delivery**
- Option (c) is intentionally friction-heavy

If `config.security_gate` is `"advisory"`:
- Findings are logged but do not block. User was warned.

---

## Step 5.1d - Multi-Pass Code Review (pr-review-toolkit)

**Invoke via Skill tool:** `pr-review-toolkit:review-pr all`

Dispatches 6 specialized review agents:
1. **code-reviewer** -- Guidelines compliance, bug detection
2. **pr-test-analyzer** -- Test coverage quality
3. **silent-failure-hunter** -- Empty catches, missing error logging
4. **type-design-analyzer** -- Type encapsulation
5. **comment-analyzer** -- Comment accuracy
6. **code-simplifier** -- Simplification opportunities

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
    {"target_phase": 4, "target_agent": "spec-X", "issue": "...", "severity": "HIGH", "ct_decision_id": "decision-X"}
  ]
}
```

Options:
- **Auto-fix** -- re-spawn responsible agent with feedback
- **Manual instructions** -- user provides fix guidance
- **Override approve** -- accept with documented exceptions
- **Stop and deliver as-is** -- deliverables with known issues documented
- **Abort**

Max 3 fix attempts. Log to `pipeline/improvements.tsv`.

**CT Decision Linkage:** When routing feedback, include `ct_decision_id` referencing the decision in `pipeline/ct-decisions.json` that led to the rejected outcome. This enables the Karpathy Loop to correlate "which CT-informed decisions led to rejections" and learn from overrides.

**Max pivot rules:**
- Phase 4 rejection: max 3 attempts per slice, then escalate
- Phase 5 rejection: max 2 cycles before user override option
- Same issue_type appears 2+ times as not_fixed: escalate immediately

---

## Step 5.4 - HUMAN APPROVAL GATE (Final)

**CHECKPOINT:** Glob for ALL required Phase 5 artifacts:
- `pipeline/05-validation-report.md` (MANDATORY)
- `pipeline/05e-adversarial-verification.md` (if adversarial verifier ran)
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

**MANDATORY before PPTX generation:**
1. Read `modules/remotion-renderer.md`
2. Install Remotion in project if not yet installed: `cd {project-path} && npm install remotion @remotion/bundler @remotion/renderer @remotion/cli`
3. Set up Remotion project structure (see `remotion-renderer.md` Project Setup section)
4. Render branded visuals: `node scripts/render-remotion.js`
5. Use rendered PNGs in `generate-pptx.js` as slide backgrounds

**MANDATORY after deliverable generation:**
Update `pipeline/tooling-manifest.md` with the Deliverable Generation section. Read `modules/tooling-manifest.md` for template.

---

## Step 5.5b - Decision Logging & Self-Improvement Evaluation

### Decision Logging
After delivery is approved, the orchestrator writes `pipeline/ct-decisions.json` summarizing key decisions from each phase. For each decision, log: phase, agent, decision made, CT framework applied (if any: fishbone, force-field, scamper, six-hats, abductive), confidence (0-1), whether the human overrode the recommendation, and the human's choice if overridden.

### Karpathy Loop Evaluation

**Timing:** Run IMMEDIATELY after Step 5.5 deliverables are generated, BEFORE marking final todos complete (Step 5.8).

Run the self-improvement evaluation script:
```bash
npx tsx skills/bridge/memory/evaluate.ts {project-path}
```

This correlates CT decisions with quality outcomes and updates `skills/bridge/memory/insights.json` with patterns discovered across 3+ projects. The insights are consumed by the Methodology Selector in Phase 3c of future projects.

If the script is unavailable or fails, log a warning and continue -- evaluation is non-blocking.

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

**Post-update dream suggestion:**
After writing the knowledge graph, check consolidation readiness:
```
Read clients/{client-slug}/.knowledge/graph.json
Count projects_completed (including this one)

IF projects_completed >= 3 AND no .knowledge/archive/ directory exists:
  Inform user: "This client now has {N} completed projects. Running
  `/bridge dream {client-slug}` would consolidate patterns, resolve
  contradictions, and help future projects start faster."

IF projects_completed >= 5:
  Strengthen recommendation: "Strongly recommended -- {N} projects without
  consolidation means the knowledge graph likely has duplicates and
  potentially stale entries."
```

This is a suggestion only -- never run dream automatically during an active pipeline.

---

## Step 5.7b - Final Integration Checklist

Before presenting final summary: `Skill: superpowers:finishing-a-development-branch` → follow integration checklist (tests green, no debug code, docs updated, clean history).

---

## Step 5.8 - FINAL SUMMARY

Present: project folder, all deliverables (internal + client), agents used, knowledge updates, cost summary.

**Include tooling manifest summary in final presentation:**
Read `pipeline/tooling-manifest.md` and present a condensed version showing:
- Total agents spawned, CLI tools used, MCP servers used, skills activated
- Remotion compositions rendered
- Diagram tools used per diagram type
- Quality score and security verdict

Mark all todos complete.
Archive successful specialists (Step 4.7).
