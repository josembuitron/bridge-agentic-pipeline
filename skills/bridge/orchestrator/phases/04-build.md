# Phase 4: Build Solution (Dynamic Agents)

## Anti-Rationalizations (Defensive Prompting)

These are the most common ways an agent rationalizes shortcuts in Phase 4. If you catch yourself thinking any of these, STOP and follow the rebuttal.

| Rationalization | Reality |
|---|---|
| "This slice is so small it doesn't need a contract" | Slice contracts exist because Anthropic's research found evaluators "talk themselves into approving mediocre work." Even small slices need TRUE/FALSE done criteria. Without a contract, "done" is subjective. |
| "Tests slow down this particular specialist" | TDD is non-negotiable. RED then GREEN then REFACTOR for EVERY slice. The Dev-QA Loop is not optional. A specialist that skips tests produces code that Phase 5 will reject. |
| "I'll run semgrep after all specialists finish" | Post-slice security scan catches issues BEFORE they propagate. Finding a SQL injection in Slice 5 when it was introduced in Slice 1 wastes 4 slices of compounding work. Scan after EACH slice. |
| "The structural linter warnings are just style issues" | Import direction violations are ARCHITECTURE violations, not style. File size guards prevent unmaintainable mega-files. These compound into technical debt that breaks Phase 5 validation. |
| "This specialist doesn't need documentation access" | Every specialist needs the crawl4ai, Context Hub, WebSearch chain. Without it, they hallucinate API parameters, use deprecated methods, or invent configuration that doesn't exist. |
| "De-Sloppify is cleanup, I can skip it" | Dead code, unused imports, and debug statements are technical debt introduced DURING the build. De-Sloppify prevents debt accumulation before validation. Skipping it means Phase 5 reviewers waste time on noise. |
| "Max 3 attempts is too strict, let me try one more time" | 3 attempts with the same approach means the approach is wrong. Escalation forces a human to provide new information or change the approach. A 4th attempt without new info repeats failure. |
| "I'll write the agent prompt inline, no need for the template" | Agent templates ensure consistent structure: tools, model, maxTurns, completion signal, documentation chain, coding standards. Inline prompts miss critical elements. The quality check (Step 4.1, item 9) exists to catch this. |
| "Parallel execution is too complex, I'll run everything sequentially" | Sequential execution when parallel is possible doubles or triples Phase 4 duration. Check the dependency graph -- if specialists have no mutual dependencies, they MUST run in parallel. |
| "BRIDGE_SLICE_COMPLETE signal is just ceremony" | Without the signal, the orchestrator cannot distinguish between "completed" and "stalled at maxTurns." The stall detection system depends on this signal. Emitting it without running tests is fraud. |
| "Tests pass, so the independent review is redundant" | The builder wrote both the code AND the tests, so green tests only prove the code is self-consistent with the builder's own assumptions. If the assumption is wrong, the test encodes the same wrong assumption and goes green. Production evidence: a green suite on SQLite hid a SQL Server IDENTITY bug that would have rejected every production insert. Fresh eyes per slice exist precisely because self-graded homework cannot catch this class of defect. |
| "Semgrep isn't installed, manual review is equivalent" | A silently degraded gate is a checkbox that was never ticked. "Per-slice security scanning" on the manifest while no scan ran is worse than no gate, because it manufactures false confidence downstream. Record DEGRADED loudly, offer to install, and get explicit acknowledgment before continuing. |

## Red Flags (Early Deviation Indicators)

Observable signs that Phase 4 is being executed incorrectly. The orchestrator SHOULD check for these during and after build:

- Specialist spawned without Bash tool in its tools list (code writer cannot execute commands)
- Slice contract has >7 done criteria (scope too large -- should be split)
- Agent prompt exceeds 2,000 tokens (context bloat, reduced effectiveness)
- Build manifest shows zero failed attempts across all specialists (suspiciously clean -- real builds have friction)
- Specialist produces code files but zero test files (TDD violated)
- BRIDGE_SLICE_COMPLETE signal emitted but no test execution output in agent response
- Parallel specialists writing to overlapping file paths (race condition on files)
- Walking skeleton (Slice 1) failed but pipeline continued to Slice 2 (architecture may be wrong)
- De-Sloppify step skipped on a project with >200 lines of code
- Semgrep scan shows zero findings on a codebase with external API calls (scan may not have run correctly)
- Specialist creates files not in the file manifest without documenting why
- High-risk slice accepted with no independent-review record in the build manifest
- A gate tool (semgrep, eslint, test runner) was unavailable and the build continued without a DEGRADED entry in the manifest
- Test suite runs on a different engine than production (e.g., SQLite vs SQL Server) with no parity warning recorded
- Data-touching slice marked complete with fixtures only -- no real-data dry run and no UNVERIFIED-ON-REAL-DATA record

---

## Pre-Phase: Skill Invocations

Before spawning first specialist (once per session):
1. `Skill: superpowers:test-driven-development` → embed TDD in ALL specialist prompts
2. `Skill: sharp-edges` (Trail of Bits) → embed dangerous API patterns warning
3. If critical business logic: `Skill: property-based-testing` (Trail of Bits)
4. If critical business logic: `Skill: testing-handbook-skills` (Trail of Bits) → embed fuzzing/sanitizer guidance for edge cases beyond unit tests
5. If frontend work: `Skill: frontend-design:frontend-design` → embed distinctive UI guidance (not generic AI aesthetics)
6. If blockchain/smart contracts: `Skill: building-secure-contracts` (Trail of Bits) → embed 20+ weird token patterns, platform-specific vulnerability checks
7. `Skill: superpowers:requesting-code-review` → methodology for the per-slice independent review gate (Step 4.3.5)
8. `Skill: superpowers:verification-before-completion` → methodology for the orchestrator-side VERIFY gate (Step 4.3.6)

Cache and reuse across all specialists.

### Skills as Live Gates, Not Just Prose

Sub-agents cannot invoke skills via the Skill tool, so specialists only ever receive a
paraphrase of TDD/verification methodology embedded in their prompt. Prose guidance is the
first thing to decay under token pressure: the agent "remembers" to write tests but quietly
drops RED→GREEN discipline, or tests only the happy path.

Therefore the prompt embedding is the belt, and the orchestrator is the suspenders: the
orchestrator itself runs `verification-before-completion` and `requesting-code-review` as
**live gates that wrap each specialist call** (Steps 4.3.5 and 4.3.6). A slice is not
accepted because the specialist says it is done; it is accepted when the orchestrator-side
gates pass. Discipline that is enforced survives; discipline that is suggested decays.

---

## Step 4.1 - Create/Update Specialist Agents

Read Solution Proposal. Parse REQUIRED SPECIALISTS.

For EACH specialist:

**Check existence:** Glob for `.claude/agents/spec-{role}.md`

### IF NOT EXISTS -- CREATE:
1. Read `templates/agent-template.md`
2. Read relevant Research Report sections
3. **Resolve dependencies** -- check if specialist needs external tools:
   a. **CLI tools**: If task requires CLIs not yet installed (e.g., `uv`, `ruff`, `terraform`, `kubectl`, `docker`), create an install script:
      ```bash
      # Write to: {project-path}/scripts/setup-{role}.sh
      #!/bin/bash
      # Auto-generated by BRIDGE for spec-{role}
      set -euo pipefail
      command -v {tool} >/dev/null 2>&1 || { echo "Installing {tool}..."; {install-command}; }
      ```
      Execute the script before spawning the agent. Log installed tools in build manifest.
   b. **MCP servers**: If task requires MCP servers the agent needs access to, add them to the agent's `tools:` frontmatter. If the MCP is not installed, inform the user at the approval gate (MCPs require interactive install).
   c. **Trail of Bits skills**: If the Architect specified skills the specialist needs embedded (e.g., `modern-python` for Python, `building-secure-contracts` for blockchain), invoke the skill in the orchestrator BEFORE composing the agent and embed the methodology in the agent's prompt.
   d. **Custom scripts**: If the Architect specified `scripts_needed`, the orchestrator writes them to `{project-path}/scripts/` BEFORE spawning and references them in the agent's prompt. Agents may also create additional scripts during execution for needs discovered at build time (see `tool-matrix.md` -- Agent Script Creation Authority).
   e. **Skill auto-download**: If the Research Report or Architect specifies a Trail of Bits skill that is not installed, inform the user:
      ```
      [WARN] Specialist {role} would benefit from skill: {skill-name}
      Install: claude plugin marketplace add trailofbits/skills (then enable {skill-name})
      Proceeding without it -- methodology will be embedded from reference docs instead.
      ```
      Then embed equivalent methodology from `docs/reference/` or `.crawl4ai/trailofbits-skills-complete-reference.md`.

4. Compose agent .md file following **skill-creator best practices**:
```yaml
name: spec-{role}
description: {from architect}
tools: {from architect, MUST include Bash for code-writers}
memory: project
model: {from architect -- read modules/model-routing.md}
maxTurns: 50
```
5. **Structure the agent using workflow patterns** (from `workflow-skill-design`):
   - **Sequential Pipeline**: For agents with ordered steps (e.g., ETL: extract → transform → load)
   - **Safety Gate**: For agents handling sensitive operations (e.g., database migration: validate → dry-run → execute → verify)
   - **Task-Driven**: For agents with independent deliverables (e.g., API endpoints)
   - **Routing**: For agents that handle multiple input types (e.g., multi-format integrator)
   Include explicit phase transitions and completion criteria for each step.
6. Assign methodologies per `modules/tool-matrix.md`
7. **Embed domain skills** -- for each Trail of Bits or superpowers skill relevant to this specialist:
   - If skill is installed: orchestrator invokes it, extracts key instructions, embeds in agent prompt
   - If skill NOT installed: embed equivalent methodology from reference docs
   - ALWAYS embed: TDD methodology, security awareness, documentation access chain
8. Add Completion Signal:
```
## Completion Signal
When slice is complete (code written, tests passing, files committed):
BRIDGE_SLICE_COMPLETE: {slice_id}
Do NOT output until tests pass and deliverables are committed.
```
9. **Quality check** -- before writing the agent file:
   - Agent has clear, specific task (not vague)
   - Agent has ALL tools it needs (no missing Bash for code writers)
   - Agent has documentation access chain (crawl4ai → Context Hub → WebSearch)
   - Agent has explicit coding standards and testing requirements
   - Agent prompt < 2,000 tokens (task + file refs + methodology, no inline blobs)
   - No anti-patterns: no vague instructions, no missing completion criteria, no tool gaps
10. Write to `.claude/agents/spec-{role}.md`
11. Mark as NEW (spawn as `general-purpose` this session)

### Dependency Installation Protocol

When a specialist requires tools not present in the environment:

1. **Auto-installable** (orchestrator handles silently):
   - npm packages: `npm install -g {package}` or project-local `npm install {package}`
   - pip packages: `pip install {package}` (or `uv pip install` if `modern-python` active)
   - System tools available via package manager: `apt-get install -y {tool}` (if permissions allow)
   - Present install plan to user at approval gate, execute on approval

2. **User-interactive** (inform and suggest):
   - Claude Code plugins: `claude plugin marketplace add {plugin}`
   - MCP servers requiring API keys: inform user of required env vars
   - Licensed tools: inform user of licensing requirements
   - The orchestrator proceeds WITHOUT these, embedding equivalent methodology from reference docs

3. **Agent-created** (specialist creates during execution):
   - Helper scripts in `{project-path}/scripts/`
   - Configuration files (`.eslintrc`, `tsconfig.json`, `pyproject.toml`, etc.)
   - Docker/compose files if architecture requires containerization
   - Mock servers or test fixtures
   - The agent template explicitly authorizes this capability

### Dependency Install Failure Handling

When an installation fails during Step 4.1:

| Failure | Action |
|---------|--------|
| **CLI tool install fails** (apt/npm/pip permission denied, network error, package not found) | Inform user with exact error. Options: (a) user installs manually, (b) proceed without tool using alternative approach, (c) abort specialist |
| **MCP server unavailable mid-build** (crash, disconnect, timeout) | Pause agent. Retry MCP connection once. If still down: resume agent with embedded methodology fallback, note degraded capability in build manifest |
| **Version conflict** (specialist needs v2 but v1 installed) | Present conflict to user. Default: install requested version. If breaking: user decides |

Never silently skip a blocking dependency. Always surface failures at the approval gate.

### IF EXISTS -- UPDATE:
1. Read current agent file
2. Compare with Research Report
3. Edit if outdated
4. Mark as EXISTING (spawn by name)

**Log team roster** to `pipeline/04-build-manifest.md`

---

## Step 4.2 - HUMAN APPROVAL GATE (Team Review)

Present team roster via AskUserQuestion:
- **Start building**
- **Modify team**
- **Review agent definition**
- **Stop here and generate deliverables**

---

## Step 4.3 - Execute Build Groups (Vertical Slice Execution)

### Parallel Specialist Dispatch (within execution groups)

When an execution group contains 2+ specialists with **no mutual dependencies** (no specialist's output is another specialist's input within the same group), spawn them ALL in a single message using multiple parallel Agent tool calls.

**Decision logic:**
```
For each execution_group:
  1. Read 03-architecture.json → get specialists and depends_on for this group
  2. Build dependency graph within the group
  3. Identify independent specialists (no edges between them)
  4. IF 2+ independent specialists exist:
     → Spawn ALL independent specialists in ONE message (parallel Agent calls)
     → Each gets its own fresh context window (no shared state)
     → Wait for ALL to return
     → Reconcile results: update build-manifest, check for conflicts
  5. IF specialists have sequential dependencies:
     → Spawn one at a time in dependency order (existing behavior)
  6. AFTER all parallel specialists return:
     → Check for file conflicts (two specialists writing same file)
     → If conflict: escalate to user with both versions
     → Run post-slice checks on ALL outputs
```

**Example -- 3 independent specialists:**
```
# ONE message, THREE Agent calls → parallel execution
Agent 1: [Phase 4] API Specialist -- Slice 1: REST endpoints
Agent 2: [Phase 4] Frontend Specialist -- Slice 1: UI components
Agent 3: [Phase 4] Data Specialist -- Slice 1: Database schema

# All three run simultaneously in separate context windows
# Orchestrator waits for all three, then reconciles
```

**Constraints:**
- Max 4 parallel specialists per message (Claude Code limit on concurrent agents)
- If >4 independent specialists: batch into groups of 4, sequential between batches
- Each parallel specialist MUST write to non-overlapping file paths (verified from solution proposal)
- If file overlap detected in proposal: force sequential execution for those specialists

**After parallel return:**
- Verify each specialist's `BRIDGE_SLICE_COMPLETE` signal
- Run structural linter on ALL outputs
- Update build-manifest with all results
- Present combined approval gate (one gate for the whole parallel batch)

---

For each execution group in dependency order, for each specialist, execute **slice by slice**:

### Per Slice:

#### Step 4.3.0 -- Slice Contract (from Anthropic's Harness Design research)

**Before ANY implementation begins**, the orchestrator establishes a **Slice Contract** -- a bilateral agreement between orchestrator and specialist on what "done" means. This contract is what the evaluator will verify against.

Write to `pipeline/04-slice-{N}-contract.md`:
```markdown
# Slice Contract: {slice_id}
**Specialist:** {role}
**Scope:** {description}

## Done Criteria (ALL must be TRUE for acceptance)
1. {specific, testable criterion -- e.g., "POST /api/users returns 201 with valid input"}
2. {specific, testable criterion -- e.g., "POST /api/users returns 400 with invalid email"}
3. {specific, testable criterion -- e.g., "User record persisted in database after POST"}
...

## Out of Scope (explicitly excluded)
- {what this slice does NOT do}

## Verification Method
- [ ] Unit tests pass for: {specific test files}
- [ ] Integration test: {specific command or curl}
- [ ] Adversarial probe: {one boundary/edge case to test}

## Files Expected
- Create: {list}
- Modify: {list}
```

**Why contracts, not just criteria:** The article found that evaluators "talked themselves into approving mediocre work." Contracts make the pass/fail decision mechanical -- each criterion is TRUE or FALSE, not "looks good enough." The Adversarial Verifier (Phase 5) uses these contracts as its verification checklist.

**Rules:**
- Contracts are written BEFORE spawning the specialist
- The specialist receives the contract as context (file path)
- Contracts derive from the Solution Proposal's slice definition -- the orchestrator does NOT invent new requirements
- Max 7 done criteria per contract (more = scope too large → split the slice)

---

1. Read Solution Proposal + current slice definition + relevant Research Report sections + Methodology Selection (`pipeline/03c-methodology-selection.md` -- adapt execution style per selected methodology's config adjustments)

2. **Write Slice Contract** (Step 4.3.0 above) if not yet written for this slice.

3. Spawn agent:
   - EXISTING: by name
   - NEW: as `general-purpose` with full prompt inline

4. **Agent description**: `[Phase 4] {Name} -- Slice {N}: {summary}`
   On fix: `[Phase 4] {Name} -- Fixing Slice {N}: {issue}`

5. **Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Solution Proposal: {project-path}/pipeline/03-solution-proposal.md (YOUR specialist section)
- Research Report: {project-path}/pipeline/02-research-report.md (relevant tech sections)
- Plan Check: {project-path}/pipeline/03b-plan-check.md (if exists -- flagged issues)
- Constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Previous slice summary: {project-path}/pipeline/04-{specialist}-slice-{N-1}-summary.md (if exists)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)

## Your Slice
Specialist: {role} | Slice: {N} | Scope: {description}
Slice Contract: {project-path}/pipeline/04-slice-{N}-contract.md (your done criteria)
File manifest: {files to create/modify}
```

6. **Code Knowledge Graph** (if `code-review-graph` available):
   - Build graph: `code-review-graph build`
   - Use impact_radius, callers_of, callees_of before modifying code

7. **Serena Code Intelligence** (if available):
   - `find_symbol`, `find_referencing_symbols`, `replace_symbol_body`, `rename_symbol`
   - Prefer Serena over Edit for modifying existing symbols

8. When encountering a blocking decision with incomplete information, apply **Abductive reasoning**: list observations, formulate 2-3 hypotheses ordered by plausibility, identify testable predictions, and implement the most plausible hypothesis with a verification step.

9. Agent writes to `src/` and `tests/`

### Dev-QA Loop Per Slice

```
BUILD (TDD: RED → GREEN → REFACTOR)
  ↓
TEST (run: npx vitest run)
  ↓
HARDEN (2-4 additional tests: error paths, boundaries, concurrency, invalid input)
  ↓
E2E (if frontend: Playwright smoke test)
  ↓
SELF-VERIFY: ALL tests pass AND acceptance criteria met? (specialist's own check)
  ├─ NO → RETRY (max 3 attempts, then ESCALATE to human)
  ↓ YES
INDEPENDENT REVIEW (Step 4.3.5 -- risk-gated, fresh reviewer that did NOT write the code)
  ├─ CRITICAL findings → root-cause first, then fix (counts toward the 3 attempts)
  ↓ PASS
REAL-DATA VERIFY (Step 4.3.6 -- only data-touching slices)
  ├─ FAIL → root-cause first, then fix
  ↓ PASS
BRIDGE_SLICE_COMPLETE → next slice
```

The specialist's SELF-VERIFY is necessary but not sufficient: the specialist wrote both the
code and the tests, so "all tests pass" only proves self-consistency with its own
assumptions. Acceptance happens at the orchestrator-side gates, not at the self-check.

**Rules:**
- Max 3 attempts per slice. After 3: escalate with root cause analysis
- Each retry MUST include failure reason from previous attempt
- Slice 1 failures escalate immediately (no retries) -- Walking Skeleton failure = architecture wrong
- **Root-cause before retry #1, not after stall #2:** whenever a review or verification
  finding contradicts a passing test (tests green, behavior wrong), invoke
  `Skill: superpowers:systematic-debugging` and write a one-paragraph root cause BEFORE the
  first fix attempt. A slice that runs fine but produces a wrong result never stalls -- the
  stall detector is structurally blind to it, so the contradiction itself is the trigger.

### Step 4.3.5 -- Per-Slice Independent Review (config.workflow.per_slice_review)

The single highest-leverage gate in Phase 4. The specialist graded its own homework in
SELF-VERIFY; this step is the fresh pair of eyes that did NOT write the code. Production
evidence for why it exists: an independent per-slice review caught a `BIGINT IDENTITY`
dialect bug (green on SQLite, fatal on SQL Server) and a silent cross-key data-loss path --
neither was visible to the slice's own passing tests, and catching them at Phase 5 would
have cost five downstream slices of rework.

**When it runs (`per_slice_review` modes):**
- `risk-gated` (default): runs only on slices the Architect flagged `Risk: high`
  (DB schema/migration, auth, money movement, real-client-data transformation,
  irreversible operations). Trivial slices skip it -- that is why it is risk-gated.
- `all`: runs on every slice.
- `off`: never runs (user accepts end-loaded verification at Phase 5).

**Two-gate sequence (both reviewers are FRESH agents -- never the slice's builder):**

1. **Gate 1 -- Spec-compliance reviewer.** Distrusts the implementer by default. Reads the
   Slice Contract (`pipeline/04-slice-{N}-contract.md`) and the ACTUAL code (not the
   specialist's summary), re-runs the test suite itself, and checks each done criterion
   TRUE/FALSE against observed behavior.
2. **Gate 2 -- Code-quality reviewer.** Reviews the slice's git diff using the Phase 4
   section of `references/ojo-critico.md`. MUST execute the code at runtime (run the tests,
   run the entry point, probe one boundary case) -- reading the diff is not enough.

**Spawn parameters:**
- Agent description: `[Phase 4] Independent Review -- Slice {N}: {gate}`
- Model: inherit the session model (omit `model:` -- see `modules/model-routing.md`; review
  must out-reason the builder, not match it)
- Context-by-reference: slice contract, git diff (`git diff {base}..HEAD`), file manifest
- The reviewer NEVER edits code. Findings go back to the specialist as enriched re-run input.

**Findings handling:**
- CRITICAL → slice is NOT complete. Apply the root-cause-before-retry rule, then re-run the
  specialist with the findings. Counts toward the slice's 3 attempts.
- WARNING/NOTE → triage per `Skill: superpowers:receiving-code-review`: real defect vs
  guard-rail vs documented invariant. Record disposition in the build manifest.
- Record every review (gate, verdict, findings count, disposition) in
  `pipeline/04-build-manifest.md`. A high-risk slice with no review record is a red flag.

### Step 4.3.6 -- Real-Data Verification (config.workflow.real_data_verification)

"Tests pass" is not "correct against the real world." Unit tests run on fixtures; production
runs on the client's actual data. For any slice that touches data migration, ingestion, or
transformation, the VERIFY step must include a **dry run against a sample of the real input**
(the actual legacy export, the actual source files), not only fixtures.

The orchestrator runs `superpowers:verification-before-completion` as a live gate here:

1. Identify the real input (from Phase 0/1 intake or the client data folder).
2. Execute the slice's pipeline end-to-end against it in dry-run/rollback mode.
3. Record evidence in the build manifest: rows in → rows out, collapsed/deduplicated counts,
   integrity errors, and an idempotency re-run (same input twice → same result, no dupes).
4. Reconcile counts against what the client claims (deck numbers, stated totals). A mismatch
   is a FINDING to surface, not noise -- real-data runs routinely catch wrong client-side
   numbers before they reach a deliverable.

**If no real data sample is available:** do NOT silently fall back to fixtures. Record
`UNVERIFIED-ON-REAL-DATA` for the slice in the build manifest and surface it at the approval
gate and in the Phase 5 handoff. The user decides whether to accept that risk.

### Post-Slice Security Scan (MANDATORY)

After EACH specialist completes AND user approves:
```bash
semgrep scan --config auto "clients/${c}/${p}/src/" 2>/dev/null
```
- CRITICAL findings → BLOCK next specialist. Present options: Fix now | Override with risk | Abort
- WARNINGS → log and continue, present in approval gate

#### Gate Degradation Protocol (applies to EVERY external-tool gate)

A per-slice gate that depends on an external tool (semgrep, eslint, test runner, Playwright)
MUST fail loudly when the tool is unavailable -- never quietly continue. A silently degraded
gate turns "per-slice security scanning" into a checkbox that was never actually ticked.

When a gate tool is missing or errors out:
1. Record `status: DEGRADED` for that gate in `pipeline/04-build-manifest.md` (gate name,
   tool, reason, slice number) and append a `gate_degraded` event to
   `pipeline/security-events.json`.
2. Offer to install the tool NOW (per the Dependency Installation Protocol above). Installing
   semgrep takes one command; skipping it costs an unscanned slice.
3. If the user declines: continue ONLY with explicit acknowledgment, and show a visible
   `[DEGRADED] {gate}: {tool} unavailable since slice {N}` line at EVERY subsequent approval
   gate until the tool is restored.
4. Phase 5 MUST re-run any gate that was DEGRADED during Phase 4 before the blocking
   security gate can pass.

### Post-Slice Structural Linter (read `modules/structural-linter.md`)

After semgrep scan, run structural checks:
1. File manifest compliance (expected vs actual files)
2. Import direction enforcement (layer violations)
3. Naming convention compliance
4. File size guard (>300 lines WARN, >500 lines ERROR)
5. Test file presence

If ERRORs found: enrich error messages per Error Enrichment Protocol (in `modules/structural-linter.md`) and re-run specialist. Linter re-runs count toward the slice's max 3 total attempts.
If only WARNs: include in approval gate summary.

---

## Step 4.4 - HUMAN APPROVAL GATE (Per Slice or Per Specialist)

**CHECKPOINT:**
1. Glob for build artifacts in `src/`. Zero files = silent failure -- re-run.
2. Verify `BRIDGE_SLICE_COMPLETE` signal. No signal = stall (see below).
3. If the slice was flagged `Risk: high`: verify the build manifest contains its
   independent-review record (Step 4.3.5). Missing record = the gate did not run -- run it
   before presenting approval.
4. If the slice touches data: verify real-data evidence or an explicit
   `UNVERIFIED-ON-REAL-DATA` record exists (Step 4.3.6).
5. After ALL specialists: create/update `pipeline/04-build-manifest.md`.

Present via AskUserQuestion:
- Slice completed and what it delivers
- Files created/modified
- Tests passing
- Cumulative functionality

Options:
- **Approve and continue to next slice**
- **Approve all remaining slices** -- skip per-slice review
- **Request changes to this slice** -- re-run with feedback
- **Skip remaining slices** -- accept thin functionality, next specialist
- **Review code** -- show specific files
- **Pause pipeline and generate deliverables**
- **Pause pipeline** -- resume later

### Milestone Delivery (if config enables -- read `modules/milestone-delivery.md`)
After each execution group completes AND passes approval, optionally generate milestone deliverable.

---

## Orchestrator as Loop Monitor (Stall Detection)

After each Agent call returns, inspect:
- Contains `BRIDGE_SLICE_COMPLETE`? → Normal exit
- Error keywords ("failed", "cannot", "unable")? → Stall: surface to human
- No output / maxTurns hit? → Timeout stall
- Partial progress (some files, no signal)? → Partial stall

**On stall:**
```
[WARN] Specialist stall: {agent-name}, Slice {N}
Status: {what was found}

Options:
  a) Re-run from scratch
  b) Re-run with a hint
  c) Skip this slice
  d) Reduce scope
  e) Pause and generate deliverables
```

- Same slice stalls 2×: auto-escalate to user hint
- Slice 1 stall: always escalate immediately
- On any agent error or unexpected result: `Skill: superpowers:systematic-debugging` → re-spawn agent with debugging methodology

---

## Step 4.5 - De-Sloppify Pass + Garbage Collection (if config.workflow.de_sloppify -- default: true)

**Agent description**: `[Phase 4] Code Cleanup -- Removing dead code, checking consistency, and improving clarity`

Spawn `general-purpose` with focused cleanup instructions:
- Remove dead code, unused imports, commented-out blocks
- Fix naming inconsistencies
- Correct inaccurate comments
- Fix YAGNI violations
- Remove debug statements
- Run eslint/linting
- Do NOT change architecture, logic, or add features
- Run tests after cleanup
- **Garbage Collection** (read `modules/garbage-collector.md`): After standard cleanup, run 5 additional checks -- dead code detection, pattern consistency, architecture drift, documentation freshness, duplicate code. Report findings but do NOT auto-fix beyond standard De-Sloppify scope.

Skip standard De-Sloppify if: <200 lines total, time-critical, or user asks to skip.
If De-Sloppify is skipped: orchestrator still runs GC checks 1 and 3 directly (Glob + Grep) for architecture drift and dead code detection.

---

## Step 4.6 - Update Build Manifest

Update `pipeline/04-build-manifest.md` with final status per specialist and slice.

---

## Step 4.7 - Archive Successful Specialists (after Phase 5 validates)

Copy `spec-{role}.md` to `.claude/agents/library/spec-{role}-{project-slug}.md` with Track Record section.
On future runs: Glob `agents/library/spec-*.md` for relevant technology matches.

### Phase Handoff
```markdown
## HANDOFF → Phase 5
- **Status**: COMPLETE
- **Key outputs**: 04-build-manifest.md, all src/ and tests/ files
- **Decisions made**: {implementation choices by specialists}
- **Open questions**: {deferred items, known limitations}
- **Warnings**: {security scan findings, skipped slices, partial implementations}
```
