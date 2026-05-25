# BRIDGE Architecture

[← Back to README](../README.md)

This document holds the deep architecture, phase-by-phase process detail, critical thinking integration, harness engineering, and resilience features. The README is the landing page; this is the manual.

---

## Modular Orchestrator Design

The pipeline orchestrator is modular -- files are loaded on-demand as each phase begins, never preloaded.

```
skills/bridge/
├── SKILL.md                          # Entry point -- triggers on /bridge
├── orchestrator/
│   ├── core.md                       # Pipeline flow, rules, guardrails, gate enforcement
│   ├── phases/
│   │   ├── 00-initialization.md      # Tool discovery, input collection, workspace setup
│   │   ├── 00b-codebase-analysis.md  # Brownfield/existing codebase support (conditional)
│   │   ├── 01-translate.md           # Phase 1: BRIDGE B-R-I-D requirements translation
│   │   ├── 02-research.md            # Phase 2: Technology research with live docs
│   │   ├── 03-architect.md           # Phase 3: Solution design + specialist team spec
│   │   ├── 04-build.md              # Phase 4: Dynamic agent creation + vertical slice execution
│   │   └── 05-validate.md           # Phase 5: Validation, security, code review, delivery
│   └── modules/
│       ├── available-plugins.md      # Full catalog of 35 ToB skills + all plugins/MCPs/CLIs
│       ├── tool-matrix.md            # Agent-to-tool assignment matrix + dependency resolution
│       ├── cross-skill-activation.md # When to activate each skill per phase
│       ├── doc-access-strategy.md    # 6-tier documentation access chain
│       ├── model-routing.md          # Cost-aware model selection (Opus/Sonnet/Haiku)
│       ├── context-budget.md         # Context window management (9 rules + enforcement)
│       ├── cost-tracking.md          # Token/cost estimation with budget caps
│       ├── pipeline-state.md         # State file for cross-session resumability
│       ├── flexible-execution.md     # Out-of-order phases, parallel execution, resume
│       ├── rollback.md               # Git tag-based phase rollback
│       ├── deliverable-generation.md # Internal + client deliverable generation
│       ├── sanitization-checklist.md # Client deliverable sanitization rules
│       ├── milestone-delivery.md     # Incremental milestone delivery
│       ├── client-knowledge-graph.md # Per-client knowledge graph (strict isolation)
│       ├── issue-tracker.md          # External issue tracker integration
│       ├── structural-linter.md      # 5-check post-build architectural compliance
│       ├── garbage-collector.md      # 5-check codebase hygiene (extends De-Sloppify)
│       ├── harness-hooks.md          # Project pre-commit hooks + pipeline protection hooks (5 guards)
│       ├── adversarial-verifier.md   # Independent execution-based verification (Phase 5)
│       ├── dream-consolidation.md    # Client knowledge graph consolidation between projects
│       ├── health-check.md           # On-demand pipeline and project health diagnostics
│       ├── proposal-fast-track.md    # 3-phase collapsed pipeline for proposals/decks (30-45 min)
│       ├── pptx-engine.md            # Coordinated multi-tool PPTX generation
│       ├── design-enforcement-hook.md # Deterministic hooks enforcing design rules
│       ├── discovery-interview.md    # Structured pre-translator discovery interview (Phase 0.5)
│       ├── pixel-agent.md            # Agent description naming convention
│       └── self-test.md              # Structural validation dry-run checklist
├── references/
│   ├── ojo-critico.md                # Critical reviewer prompt template
│   ├── tool-risk-matrix.md           # Risk classification + taint tracking protocol
│   ├── prompt-defense-baseline.md    # Self-defense block injected into every spawned agent
│   └── rubric-scoring.md             # Per-phase weighted rubrics for Ojo Critico
├── ct/methodologies/
│   └── catalog.json                  # 24 dev frameworks with bridge_compatibility scores
└── memory/
    ├── program.md                    # Karpathy Loop: what to evaluate (editable)
    ├── evaluate.ts                   # Post-project correlation script
    └── insights.json                 # Patterns from past projects (auto-updated)
```

## Core Agents (6 persistent agents)

| Agent | Role | Model | Key Tools |
|---|---|---|---|
| **requirements-translator** | Extracts structured requirements from unstructured input | Sonnet | Context7, sequential-thinking, memory |
| **researcher** | Fetches live docs, evaluates tools, APIs, MCPs | Sonnet | Context7, Playwright, memory, crawl4ai CLI |
| **solution-architect** | Designs architecture, specifies agent team | Opus | Context7, Playwright, Excalidraw, Serena, Greptile, azure/aws-pricing, uml, memory |
| **validator** | Goal-backward requirements verification | Opus | Context7, gitguardian, Serena, Greptile, code-review-graph, memory |
| **code-reviewer** | Code quality, test coverage, documentation | Sonnet | memory, eslint CLI |
| **adversarial-verifier** | Tries to BREAK the implementation by executing code independently | Opus | Bash (curl, servers), Playwright MCP |
| **security-auditor** | SAST, secrets, dependencies, OWASP Top 10 | Opus | gitguardian, memory, semgrep CLI |

## Dynamic Specialist Agents (created per project)

The Architect specifies which specialists are needed. The orchestrator creates them dynamically in Phase 4. Examples:

- `spec-netsuite-integrator`, `spec-quickbooks-integrator`, `spec-salesforce-integrator`
- `spec-etl-pipeline-engineer`, `spec-data-warehouse-engineer`, `spec-fabric-engineer`
- `spec-python-backend`, `spec-typescript-frontend`, `spec-fullstack-developer`
- `spec-azure-deploy`, `spec-terraform-engineer`, `spec-ml-engineer`

Each specialist includes: task definition, tools, methodology (TDD, security awareness), documentation access chain, completion signal, and quality checklist. Specialists persist between runs and accumulate knowledge via project memory.

---

## Complete Process Detail

### Phase 0: Initialization

```
0.0  Tool & Resource Discovery (cross-platform)
     ├── Multi-fallback detection chains per tool (binary → module → import)
     ├── Windows: pip user-site, npm globals, Git Bash PATH handled
     ├── macOS/Linux: venv isolation, Homebrew/apt paths handled
     ├── Smart Plugin Check -- compare installed vs recommended
     └── Auto-install missing CLIs (platform-aware: choco/brew/apt)

0.0b Smart Plugin Check
     └── Report gaps: "Missing: semgrep (CRITICAL), lighthouse (MEDIUM)"

0.1  Collect Input
     ├── Paste text, provide file path, or describe project
     └── Support: meeting transcripts, emails, chats, specs, URLs

0.2  Validate Understanding (MANDATORY before folder creation)
     └── Confirm: client name, project name, problem interpretation

0.3  Create/Reuse Client/Project Folder
     └── clients/{client-slug}/{project-slug}/

0.3b Load Client Knowledge Graph (if returning client)
     └── Technology decisions, constraints, anti-patterns from prior projects

0.4  Initialize Configuration
     ├── Interactive or YOLO mode
     ├── Model profile (quality/balanced/budget)
     ├── Budget cap (optional)
     └── Feature flags for every workflow step

0.5  Discovery Interview (default ON, user can skip per category or skip entirely)
     ├── 6 categories: identity, business outcome, stack, quality, delivery, branding
     ├── Opening prompt offers "skip discovery" as an explicit option
     └── Locks high-leverage constraints into pipeline/00-constraints.md
0.6  Initialize Todo List
```

### Phase 0b: Codebase Analysis (conditional -- brownfield projects)

```
Only if user references existing codebase:
├── Scan project structure and conventions
├── Identify technology stack and patterns
├── Map existing architecture
└── Feed findings into Phase 1 as constraints
```

### Phase 1: Translate

```
1.0  Assumption Elimination Gate (MANDATORY -- blocks pipeline until answered)
     └── Any unstated assumption in the input must be lifted to a user question

1.1  Spawn Requirements Translator
     ├── BRIDGE B-R-I-D analysis with Fishbone/Ishikawa root cause categorization
     │   (People / Process / Technology / Data / Environment / Measurement)
     └── Produces: 01-technical-definition.md + 01a-bridge-analysis.md

1.2  Ojo Critico Review (if config.critical_review=true)
     ├── Numeric rubric scores (see references/rubric-scoring.md) + qualitative findings
     └── Skeptical reviewer challenges output → 01c-critical-review.md

1.3  Human Approval Gate
     └── Options: Approve / Modify / Stop and deliver / Reject
```

### Phase 2: Research

```
2.1  Spawn Technology Researcher
     ├── 6-tier doc access: llms.txt → Context7 → DeepWiki → crawl4ai → Playwright → Context Hub → WebSearch
     ├── Validates D-preliminary from Phase 1 (marks [CONFIRMED], [CORRECTED], [NOT AVAILABLE])
     ├── Force-Field analysis per technology: driving forces vs restraining forces (scored 1-5)
     ├── Security & Taint Assessment:
     │   ├── Classify taint sources by trust level (TRUSTED / SEMI-TRUSTED / UNTRUSTED)
     │   ├── Map critical sinks (SQL, file writes, command exec, HTML render)
     │   └── Tool risk assessment per references/tool-risk-matrix.md
     └── Produces: 02-research-report.md (includes Security & Taint Assessment section)

2.2  Ojo Critico Review
2.3  Human Approval Gate
```

### Phase 3: Architect

```
3.1  Spawn Solution Architect
     ├── Architecture diagrams (Mermaid + optional Excalidraw PNG/SVG)
     ├── Cloud cost models (azure-pricing, aws-pricing MCPs)
     ├── File manifest for every file to create
     ├── Specialist team specification with dependencies
     ├── Vertical slice decomposition (walking skeleton methodology)
     ├── SCAMPER analysis: Substitute/Combine/Eliminate to prevent over-architecture
     ├── Security Guardrails (Section H): guardrails for HIGH-risk integrations from Phase 2 taint assessment
     ├── Project Quality Hooks (Section I): pre-commit hooks for the project's tech stack
     └── Produces: 03-solution-proposal.md (Sections A-I)

3.2  Ojo Critico Review
3.3  Plan Checker (7 dimensions: req coverage, deps, integration, scope, tests, gaps, BRIDGE)

3.6  Methodology Selection (CT-driven)
     ├── Reads catalog of 24 development frameworks (11 traditional + 13 AI-powered)
     ├── Filters by bridge_compatibility > 0.6
     ├── Six Thinking Hats analysis on top 5 candidates:
     │   White (data) / Red (intuition) / Black (risks) / Yellow (benefits) / Green (creative) / Blue (process)
     ├── Force-Field analysis on top 2: driving forces vs restraining forces (scored 1-5)
     ├── Adjusts Phase 4 config (gate frequency, parallelization, testing rigor)
     └── Produces: 03c-methodology-selection.md

3.7  Human Approval Gate (includes methodology justification)
```

### Phase 4: Build

```
PRE-PHASE: Skill Invocations (cached, reused across specialists)
├── superpowers:test-driven-development → embed TDD in all prompts
├── sharp-edges (ToB) → dangerous API patterns warning
├── property-based-testing (ToB) → if critical business logic
├── testing-handbook-skills (ToB) → if critical business logic
├── frontend-design → if frontend work
└── building-secure-contracts (ToB) → if blockchain/smart contracts

4.1  Create/Update Specialist Agents
     ├── Read Architect's specialist specifications
     ├── Resolve dependencies:
     │   ├── CLI tools → auto-install via setup script
     │   ├── npm/pip packages → install before spawning
     │   ├── MCP servers → add to agent tools or degrade gracefully
     │   ├── Trail of Bits skills → invoke and embed, or embed from reference docs
     │   └── Custom scripts → create mock servers, data generators, etc.
     ├── Compose agent with workflow pattern (sequential/safety-gate/task-driven/routing)
     ├── Quality check: clear task, all tools, doc access chain, <750 words prompt
     ├── Inject Prompt Defense Baseline (see references/prompt-defense-baseline.md)
     └── Write to .claude/agents/spec-{role}.md

4.2  Human Approval Gate (Team Review)
     └── Review specialist team before building starts

4.3  Execute Build Groups (Vertical Slice Execution)
     For each specialist, slice by slice:

     ┌─────────────────────────────────────────────────┐
     │  BUILD (TDD: red → green → refactor)            │
     │    ↓                                            │
     │  TEST (vitest run / pytest / framework-specific)│
     │    ↓                                            │
     │  HARDEN (2-4 additional tests:                  │
     │    error paths, boundaries, concurrency,        │
     │    invalid input)                               │
     │    ↓                                            │
     │  E2E (if frontend: Playwright smoke test)       │
     │    ↓                                            │
     │  POST-SLICE SECURITY SCAN (MANDATORY):          │
     │    semgrep scan --config auto src/              │
     │    ├── CRITICAL → BLOCK next specialist         │
     │    └── WARNING → log, present at gate           │
     │    ↓                                            │
     │  STRUCTURAL LINTER (orchestrator, no LLM):      │
     │    ├── File manifest compliance                 │
     │    ├── Import direction enforcement             │
     │    ├── Naming convention compliance             │
     │    ├── File size guard (>300 WARN, >500 ERROR)  │
     │    └── Test file presence check                 │
     │    ↓                                            │
     │  VERIFY: all tests pass + acceptance criteria?  │
     │    ├── YES → BRIDGE_SLICE_COMPLETE → next slice │
     │    └── NO → RETRY (max 3, then escalate)        │
     └─────────────────────────────────────────────────┘

     Abductive reasoning: when data is incomplete, list 2-3 hypotheses
     ordered by plausibility, implement most plausible with verification step.

4.4  Human Approval Gate (Per Slice or Per Specialist)
     └── Milestone Delivery: optionally generate client deliverable per execution group

4.5  De-Sloppify Pass + Garbage Collector
     ├── De-Sloppify: dead code, naming, YAGNI, debug statements, unused imports (Haiku)
     └── Garbage Collector (5 checks):
         GC-1: Dead code / orphaned files | GC-2: Pattern consistency
         GC-3: Architecture drift | GC-4: Documentation freshness | GC-5: Duplicate code

4.6  Update Build Manifest
4.7  Archive Successful Specialists (for future reuse)
```

### Phase 5: Validate and Deliver

```
PRE-PHASE: Security Skill Invocations
├── superpowers:verification-before-completion
├── static-analysis (ToB) → deep SAST (CodeQL + Semgrep + SARIF)
├── supply-chain-risk-auditor (ToB) → dependency audit
├── differential-review (ToB) → code drift vs architecture plan
├── spec-to-code-compliance (ToB) → evidence-based spec alignment
├── audit-context-building (ToB) → ultra-granular code analysis
├── fp-check (ToB) → false positive verification gate
├── variant-analysis (ToB) → if vulnerability found
├── semgrep-rule-creator (ToB) → if vulnerability found
├── agentic-actions-auditor (ToB) → if GitHub Actions CI/CD
├── zeroize-audit (ToB) → if code handles crypto/secrets
├── constant-time-analysis (ToB) → if timing-sensitive crypto
├── building-secure-contracts (ToB) → if blockchain
├── firebase-apk-scanner (ToB) → if Android+Firebase
└── second-opinion (ToB) → if external LLM CLI available

5.1a Validator Agent (Requirements & Architecture)
     ├── Goal-backward verification from business goal
     ├── Stub detection (empty bodies, TODO, orphaned components)
     ├── Requirements traceability matrix (REQ-XXX → file:line)
     ├── BRIDGE alignment check (R, I, D-validated, G+E)
     ├── Locked constraints verification
     ├── Doc-Architecture sync checks (DOC_DRIFT: doc says X, code does Y)
     └── Produces: 05-validation-report.md (APPROVE/REJECT)

5.1b Code Reviewer Agent
     ├── Clean code: naming, SRP, error handling
     ├── Test quality: meaningful tests, edge cases, no assert(true)
     ├── YAGNI violations
     ├── ESLint scan
     └── Produces: 05a-code-review.md (PASS/FAIL)

5.1c Security Auditor Agent (BLOCKING)
     ├── SAST: semgrep scan --config auto --json
     ├── Secrets: gitguardian MCP + pattern grep (AKIA, sk-, passwords)
     ├── Dependency audit: npm audit / pip-audit
     ├── OWASP Top 10 review on all endpoints
     ├── Insecure defaults check
     └── Produces: 05c-security-audit.md (SECURE/BLOCKED)

5.1d Multi-Pass Code Review (pr-review-toolkit)
     ├── Pass 1: Code reviewer -- guidelines, bugs
     ├── Pass 2: Test analyzer -- coverage quality
     ├── Pass 3: Silent failure hunter -- empty catches, missing logs
     ├── Pass 4: Type design analyzer -- encapsulation
     ├── Pass 5: Comment analyzer -- accuracy
     ├── Pass 6: Code simplifier -- simplification opportunities
     └── Produces: 05b-pr-review.md

5.1e Optional: Mutation Testing (stryker)
     └── Score >80% strong, 60-80% warning, <60% critical

5.2  Quality Score Calculation (see "Quality Scoring" below)

5.3  Rejection Loop (max 2 cycles)
     ├── Route issues to responsible agent with targeted feedback
     ├── Auto-fix or manual instructions
     └── Same issue 2+ times → escalate immediately

5.4  Human Approval Gate (Final)

5.5  Generate Deliverables
     ├── Internal: pipeline/ (full details)
     └── Client: deliverables/ (sanitized -- no AI/agent references)

5.5b Decision Logging & Self-Improvement Evaluation
     ├── Log all key decisions to pipeline/ct-decisions.json:
     │   phase, agent, CT framework used, confidence, human override status
     └── Karpathy Loop: evaluate.ts correlates decisions with quality outcomes
         └── Patterns from 3+ projects → insights.json (feeds future methodology selection)

5.6  Cross-Run Lesson Capture (failures requiring 2+ attempts → lessons)
5.7  Update Client Knowledge Graph
5.7b Final Integration Checklist (superpowers:finishing-a-development-branch)
5.8  Final Summary + Cost Report
```

### Security Gate (BLOCKING by default)

```
config.security_gate = "blocking" (default):
  ANY CRITICAL finding → BLOCKED (stronger than REJECT)
  Options:
    a) Auto-fix -- re-spawn responsible specialist with security feedback
    b) Manual fix -- user provides guidance
    c) Accept risk -- user must type "I accept the risk for: {finding}" (per finding)
    d) Abort delivery

config.security_gate = "advisory":
  Findings logged but do not block. User was warned.
```

---

## Quality Scoring

Phase 5 computes a composite quality score for every project:

```
quality_score = (requirements_coverage * 0.35)
              + (test_pass_rate         * 0.25)
              + (security_score         * 0.20)
              + (code_quality           * 0.10)
              + (documentation          * 0.10)
```

| Component | Weight | Measurement |
|---|---|---|
| Requirements Coverage | 35% | REQs addressed / total REQs in Technical Definition |
| Test Pass Rate | 25% | Tests passing / total tests (`vitest run --reporter=json`) |
| Security Score | 20% | Semgrep SAST findings + GitGuardian secrets scan |
| Code Quality | 10% | ESLint errors, complexity, duplication checks |
| Documentation | 10% | Documented APIs / total APIs + README completeness |

**Decision thresholds:**
- **>= 0.80** -- APPROVE
- **0.60 - 0.79** -- CONDITIONAL APPROVE (specific improvements listed)
- **< 0.60** -- REJECT (routed back to responsible agent with targeted feedback)

Ojo Critico produces a complementary numeric rubric at each gate (Phase 1, 2, 3, 5) -- see `skills/bridge/references/rubric-scoring.md`. The composite quality score above and the Ojo Critico rubrics are orthogonal: one measures the project, the other measures the review.

---

## Critical Thinking Integration

CT frameworks are applied as reference knowledge at key decision points -- not as separate scripts or modules, but embedded in agent prompts where they add the most value.

| Phase | CT Framework | What It Does |
|---|---|---|
| **1 -- Translate** | **Fishbone/Ishikawa** | Categorizes root causes into 6 dimensions: People, Process, Technology, Data, Environment, Measurement |
| **2 -- Research** | **Force-Field Analysis** | Scores driving forces vs restraining forces (1-5) for each technology recommendation |
| **3 -- Architect** | **SCAMPER** | Substitute, Combine, Eliminate checks prevent over-architecture before finalizing design |
| **3c -- Methodology** | **Six Thinking Hats** | 6 perspectives (data, intuition, risks, benefits, creative, process) evaluate 24 development methodologies |
| **3c -- Methodology** | **Force-Field** | Final scoring of top 2 methodology candidates with driving vs restraining forces |
| **4 -- Build** | **Abductive Reasoning** | When data is incomplete, formulate 2-3 hypotheses ordered by plausibility, implement most plausible with verification |
| **1-3 Gates** | **Ojo Critico** | Skeptical review combining Paul-Elder intellectual standards with Watson-Glaser evaluation |
| **5 -- Validate** | **Goal-Backward** | Dialectical: what conditions must be TRUE vs what IS true in the code |

### Self-Improvement (Karpathy Loop)

After each completed project, the pipeline evaluates its own decisions:
- Logs key decisions to `pipeline/ct-decisions.json` with phase, CT framework, confidence, and human override status
- `evaluate.ts` correlates CT decisions with quality outcomes
- Patterns confirmed across 3+ projects become insights in `memory/insights.json`
- Future projects use insights to select better methodologies and calibrate confidence
- `program.md` defines what to evaluate -- editable, so you control the direction of improvement

### 24 Development Methodology Catalog

The methodology selector chooses from 24 frameworks based on project characteristics:

**Traditional (11):** Agile, Waterfall, Scrum, Kanban, DevOps, Lean, XP, RAD, FDD, Spiral, Hybrid

**AI-Powered (13):** Agentic AI-Driven, Hybrid VSM, Context-First, Platform Engineering, AgentSecOps, CTEM, Data-Centric AI, Human-in-the-Loop, Predictive Sprint Planning, Shift Intelligence Left, Automated QC, AI Governance at IDE, Upskilling

Each framework has a `bridge_compatibility` score (0.0-1.0), `best_for` project types, and `config_adjustments` that change how Phase 4 operates (gate frequency, parallelization, testing rigor).

---

## Harness Engineering

Two independent hook systems protect code quality and pipeline integrity.

### Project Pre-Commit Hooks

The Architect generates hooks appropriate for the project's tech stack (Section I of the Solution Proposal). Walking Skeleton installs them in Slice 1.

| Hook | Node.js/TypeScript | Python |
|---|---|---|
| Lint staged | eslint | ruff |
| Type check | tsc --noEmit | ty / pyright |
| Test affected | vitest related | pytest -x |
| Secret scan | grep AKIA, sk-, password= | grep AKIA, sk-, password= |
| File size | >500 lines = WARN | >500 lines = WARN |

**Three modes:** Off (default) | Warn (detect, never block) | Enforce (block on violations)

### Hookify Enforcement (always-on, mechanical)

9 hookify files provide regex-based enforcement that runs automatically on every tool call. Two scopes:

**Global hooks** (`~/.claude/`) -- active in ALL Claude Code sessions:

| Hook | Event | Detects |
|---|---|---|
| **bridge-destructive-commands** | bash | rm -rf, force push, DROP TABLE, kubectl delete + composite command chains |
| **bridge-scope-escape** | file write | Writes to .claude/settings, .git/objects, node_modules |
| **bridge-secrets-detection** | file write | AWS keys (AKIA), API tokens (sk-), private keys, hardcoded passwords |
| **bridge-em-dash-titlecase** | file write | Em dashes and 3+ consecutive Title Case words in headings |

**Project hooks** (`.claude/` in workspace) -- active only during BRIDGE:

| Hook | Event | Detects |
|---|---|---|
| **bridge-zero-assumptions** | file write | Hedging language: "probably", "I assume", "likely", "I think this is" |
| **bridge-completion-check** | stop | Verification checklist before agent stops |
| **bridge-client-install-guard** | bash | npm/pip/yarn install targeting clients/ folders |
| **bridge-node-path** | file write | .js files using global npm packages without NODE_PATH preamble |
| **bridge-taint-cleanup** | file write | [EXTERNAL-UNVERIFIED] tags in deliverables/ |

**Layered enforcement model:**
- Hookify = always-on baseline (warn mode, never blocks)
- Harness hooks OFF = only hookify coverage
- Harness hooks WARN = hookify + settings.json warnings
- Harness hooks ENFORCE = hookify + settings.json BLOCKING

### Pipeline Protection Hooks (Claude Code settings.json)

Optional additional hooks with configurable enforcement (off/warn/enforce):

| Hook | Detects |
|---|---|
| **Destructive Command Guard** | rm -rf, git push --force, DROP TABLE, kubectl delete |
| **Secrets in Output Guard** | AWS keys, API tokens, passwords in Write/Edit |
| **Scope Escape Guard** | File writes outside project path |
| **Composite Action Guard** | Chained commands (&&, ;) where any part is destructive |
| **Written-File-Execution Guard** | Files written then executed -- content checked for destructive patterns |

### Taint Tracking & Tool Risk Matrix

External data sources classified by trust level:
- **TRUSTED:** Internal, controlled sources
- **SEMI-TRUSTED:** Partner APIs with SLA
- **UNTRUSTED:** User input, public web, file uploads

Critical sinks mapped (SQL, file writes, command exec). HIGH-risk integrations get architectural guardrails in Phase 3.

---

## Resilience Features

| Feature | How It Works |
|---|---|
| **Pipeline State File** | `state.json` tracks completed phases, specialist status, last checkpoint. Resume picks up exactly where you left off. |
| **Git Rollback** | Git tags after each phase approval. "Go back to Phase 2" restores pipeline state via `git checkout`. |
| **Stall Detection** | Missing `BRIDGE_SLICE_COMPLETE` signal, error keywords, or timeout → auto-escalate. Walking skeleton failures escalate immediately. |
| **Rejection Loops** | Max 3 retries per slice, max 2 validation cycles. Same issue appearing 2+ times escalates immediately. |
| **Context Budget** | 10 rules: file-bridge (never accumulate), phase refresh (re-read core.md at key points), prompt size guard (<750 words), emergency recovery, rejection loop memory. |
| **Cost Tracking** | Per-agent token/cost estimation (chars/4). Optional budget cap with 80% warning and 100% pause. |
| **Flexible Execution** | Run phases in any order, skip ahead, run in parallel with reconciliation. |
| **Cross-Run Lessons** | Failures requiring 2+ attempts generate lessons loaded automatically in future runs. |
| **Client Knowledge Graph** | Per-client isolation. Technology decisions, constraints, anti-patterns persist across projects. |
| **Discovery Interview** | Default ON in Phase 0.5 with explicit skip option in the first prompt. 6-category structured interview locks high-leverage constraints before Phase 1 burns tokens. |
| **Prompt Defense Baseline** | Every spawned agent receives a self-defense block protecting against prompt injection in transcripts, fetched URLs, retrieved documents, and code comments. |
| **Ojo Critico with Rubric Scoring** | Skeptical reviewer after Phases 1-3 catches issues before expensive build work. Default: REJECT. Produces both numeric weighted scores (per `rubric-scoring.md`) and qualitative CRITICAL/WARNING/NOTE findings. |
| **Adversarial Verifier** | Independent agent that EXECUTES code and tries to break it -- boundary values, idempotency, type confusion. Anti-rationalization guards prevent "the code looks correct" shortcuts. |
| **Dream Consolidation** | `/bridge dream {client}` -- consolidates, reconciles, and prunes a client's knowledge graph across projects. Detects contradictions, archives stale decisions. |
| **Proposal Fast Track** | Deliverable-only projects (proposals, decks, assessments) get a collapsed 3-phase pipeline: Understand → Generate Assets → Assemble. 4-5 agents instead of 12+, 30-45 minutes instead of 2-3 hours. Design Director agent with professional visual standards. |
| **Visual-First Presentations** | Enforced deck design rules: 7 slides max, visual-first (every slide leads with imagery), stat cards over bullet lists, cascading timelines, PresentationGO searched by exact diagram type, editable architecture shapes in appendix, no em dashes, sentence case. |
| **Image Selection Protocol** | Cover images generated through competitive comparison: one Hyperframes candidate vs. up to 5 stock photos, scored on industry relevance/quality/brand fit, best wins. Under 5 minutes. |
| **Smart Deliverable Folders** | Typed subfolder structure under `deliverables/` (proposals, reports, code, data, images, scripts) instead of flat file dumps. |
| **Coordinated PPTX Engine** | python-pptx as master builder, pptxgenjs for editable shapes, PresentationGO for layout reference, Hyperframes for visuals. Brand templates and PresentationGO slides combined with brand colors. 6-level fallback chain. |
| **Design Enforcement Hooks** | Deterministic shell hooks enforce design rules: no em dashes, no local installs in clients/, NODE_PATH preamble required, PresentationGO generic search blocked. Mechanical rules get hooks, subjective rules get agent prompts + human gates. |
| **Cross-Platform Tool Detection** | Fallback chain per tool: CLI binary > package manager > Python import > npm global. Caches `NPM_GLOBAL_PATH` for Windows compatibility. Never re-installs tools already present. |
| **No Local Installations** | Enforced guardrail: never install packages inside client folders. All tools are global. Temp projects go in system temp directory. |
| **Rejection Loop Memory** | Re-run agents receive explicit feedback on WHY the previous attempt was rejected, preventing repeated mistakes. |
| **Standardized Return Contract** | All validation agents report in a 5-field format (Scope, Findings, Fixes, Validated vs. Unverified, Verdict) for consistent orchestrator parsing. |
| **Analysis Paralysis Guard** | 5+ consecutive reads without writing → must explain or report BLOCKED. |
| **Deviation Rules** | Auto-fix bugs/safety; escalate architecture changes; skip scope creep. |
| **Self-Test** | `bridge self-test` validates all referenced files, templates, agents, and docs exist. The `npm test` structural suite enforces this in CI. |

---

## Project Output Layout

```
clients/{client}/{project}/
├── README.md                          # Project metadata and progress
├── input/
│   └── original-input.md             # Original requirements (preserved)
├── pipeline/                          # Internal artifacts (your team only)
│   ├── config.json                    # Pipeline configuration
│   ├── state.json                     # Pipeline state for resumability
│   ├── cost-log.json                  # Token/cost estimation per agent
│   ├── 00-constraints.md             # Locked decisions from discovery / discuss phase
│   ├── 01-technical-definition.md    # Requirements translation
│   ├── 01a-bridge-analysis.md        # Full BRIDGE B-R-I-D-G-E analysis
│   ├── 01c-critical-review.md        # Ojo Critico review (Phase 1)
│   ├── 02-research-report.md         # Technology research
│   ├── 02c-critical-review.md        # Ojo Critico review (Phase 2)
│   ├── 03-solution-proposal.md       # Architecture design
│   ├── 03b-plan-check.md             # Pre-build plan validation
│   ├── 03c-critical-review.md        # Ojo Critico review (Phase 3)
│   ├── 04-build-manifest.md          # Build status per specialist/slice
│   ├── 05-validation-report.md       # Validator assessment
│   ├── 05a-code-review.md            # Code review results
│   ├── 05b-pr-review.md              # 6-pass PR review results
│   ├── 05c-security-audit.md         # Security audit (BLOCKING)
│   ├── quality-score.json            # Composite quality score
│   ├── ojo-critico-scores.jsonl      # Per-gate rubric scores (append-only)
│   ├── 03c-methodology-selection.md  # CT-selected development methodology
│   ├── ct-decisions.json             # Decision audit trail for self-improvement
│   ├── feedback-routing.json         # Issue routing for fix cycles
│   ├── improvements.tsv              # Fix attempt tracking
│   ├── error-log.md                  # Pipeline error history
│   ├── internal-summary.md           # Final summary with cost report
│   └── lessons/                      # Cross-run learnings
├── src/                               # Built solution code
├── tests/                             # Test suites
├── scripts/                           # Auto-generated setup/mock scripts
├── deliverables/                      # Client-facing documents (sanitized)
│   ├── README.md                     # Table of contents
│   ├── solution-proposal.md          # Architecture + recommendations
│   ├── client-report.md              # Full technical report
│   ├── architecture-diagrams.md      # Mermaid diagrams + descriptions
│   ├── deployment-guide.md           # Step-by-step deployment
│   ├── api-reference.md              # API documentation (if applicable)
│   ├── {project}-report.html         # Interactive HTML report
│   └── images/                       # Diagram exports (PNG/SVG)
└── brand-assets/                      # Your brand guidelines
    ├── brand-config.json             # Colors, fonts, logo
    └── templates/                    # PPTX, DOCX, CSS templates
```

Client deliverables are fully sanitized -- no agent, pipeline, or AI system references. The `deliverables/` folder is independently shareable.

---

## Repository Layout

```
bridge-agentic-pipeline/
├── .claude/agents/      # Core agent definitions (6 agents)
├── .claude/commands/    # Slash command entry point (/bridge)
├── .claude-plugin/      # Plugin metadata (for marketplace distribution)
├── .github/             # FUNDING.yml for GitHub Sponsors
├── agents/              # Agent definitions (plugin distribution copy)
├── docs/                # Architecture, reference, commands, domain knowledge
├── scripts/             # bridge CLI (doctor, status)
├── skills/bridge/       # Pipeline orchestrator (SKILL.md + modular phases/modules)
├── templates/           # Output format templates
├── tests/               # Structural tests + canonical input fixtures
├── CHANGELOG.md         # Release notes
├── CLAUDE.md            # Project-level Claude Code instructions
├── DISCLAIMER.md        # Legal notice for pipeline-generated outputs
├── LICENSE              # MIT License
├── README.md            # Landing page
├── SETUP.md             # Detailed setup, installation, and usage tips
├── VERSION              # Semantic version
└── package.json         # Node tooling + bridge CLI bin
```
