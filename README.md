[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Built%20for-Claude%20Code-blueviolet)](https://claude.com/claude-code)
[![Pipeline](https://img.shields.io/badge/Pipeline-BRIDGE%20v2-orange)](https://github.com/josembuitron/bridge-agentic-pipeline)

# BRIDGE Agentic Pipeline

**Turn business requirements into delivered technical solutions — automatically.**

Most AI development tools help you write code faster. Bridge does something different: it takes a messy meeting transcript, a client email, or a rough product brief and runs it through a structured pipeline that translates requirements, researches technologies, designs architecture, builds the solution, and validates everything before delivery. You get working code, client-ready proposals, and architecture diagrams — not just autocomplete suggestions. It is the difference between an AI assistant and an AI development team.

---

## Who This Is For

| You are a... | Bridge helps you... |
|---|---|
| **Development agency** | Go from client call to delivered proposal in hours, not weeks |
| **Consultancy / advisory firm** | Generate technology assessments and solution proposals with real cost models |
| **Fractional CTO / engineering lead** | Run a full development pipeline solo — Bridge acts as your analyst, researcher, architect, and QA team |
| **Startup founder** | Build your MVP with enterprise-grade process without the enterprise-grade team |
| **Freelance developer** | Deliver professional proposals and architecture docs that justify premium rates |
| **Data engineering team** | Design ETL pipelines, API integrations, and dashboard architectures with validated tech stacks |
| **System integrator** | Connect platforms (NetSuite, Salesforce, Dynamics 365) with researched, documented approaches |

---

## How It Works

```
 INPUT                    PIPELINE                                    OUTPUT
 ─────                    ────────                                    ──────

 Meeting transcript   ┌─────────────────────────────────────────┐   Client-ready
 Client email        │  Phase 1: TRANSLATE (BRIDGE B-R-I-D)    │   deliverables
 Product brief  ───> │  Phase 2: RESEARCH technologies          │ ───> Solution proposals
 Chat messages       │  Phase 3: ARCHITECT solution             │   Architecture diagrams
 Requirements doc    │  Phase 4: BUILD (vertical slices + TDD)  │   Working code + tests
                     │  Phase 5: VALIDATE and deliver           │   Deployment guides
                     └─────────────────────────────────────────┘   Quality reports

 Human approval gates at EVERY phase. Stop at any point and get deliverables.
```

### The Five Phases

| Phase | What Happens | What You Get |
|---|---|---|
| **1 — Translate** | Raw input analyzed through the BRIDGE framework. Business challenges, root causes, impact metrics, and data context extracted. | Technical Definition + BRIDGE Analysis |
| **2 — Research** | APIs, platforms, and technologies investigated using live documentation. Claims from Phase 1 validated against real-world data. | Research Report with verified tech stack |
| **3 — Architect** | Complete solution designed with architecture diagrams, cloud cost models, specialist team breakdown, and vertical slices. | Solution Proposal + Mermaid diagrams |
| **4 — Build** | Dynamic specialist agents execute each vertical slice using TDD. Walking skeleton first, then incremental hardening. | Working code, tests, build manifest |
| **5 — Validate** | Goal-backward verification, 6-pass code review, SAST security scanning, secrets detection, and quality scoring. | Validation report + client deliverables |

You control the pipeline at every step. Approve, modify, go back, or stop and generate deliverables from whatever is complete. The most common exit point is Phase 3 — perfect for generating client proposals without writing code.

---

## The BRIDGE Framework

BRIDGE is a structured methodology for translating business problems into technical solutions. It ensures every project starts from the real problem, not from a premature technology choice.

| Letter | Phase | Owner | Purpose |
|---|---|---|---|
| **B** | Business Challenge | Translator | What was said vs. what is actually needed |
| **R** | Root Causes | Translator | Causal analysis — why the problem exists |
| **I** | Impact & Symptoms | Translator | KPIs, financial exposure, operational friction |
| **D** | Data & Context | Translator + Researcher | Systems, APIs, constraints (preliminary, then validated) |
| **G** | Generate Use Cases | Architect | 3-5 technical use cases mapped to root causes |
| **E** | Evaluate Feasibility | Architect | Viability, complexity, timeline, risk for each use case |

Rather than concentrating all analysis in one agent, BRIDGE phases are distributed where each agent has the right expertise:

```
B --- R --- I --- D(prelim)          D(validated)          G --- E
|--------------------------|         |--------------|      |--------------|
      Phase 1: Translator             Phase 2: Researcher    Phase 3: Architect
      (business analysis)             (tech validation)      (solution design)
```

Read the original article: **[Why Some AI Projects Start with the Wrong Problem](https://www.linkedin.com/pulse/why-some-ai-projects-start-wrong-problem-jose-milton-buitron-4bbme/)**

---

## Complete Architecture

### Modular Orchestrator Design

The pipeline orchestrator is modular — files are loaded on-demand as each phase begins, never preloaded.

```
skills/bridge/
├── SKILL.md                          # Entry point — triggers on /bridge
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
│       ├── harness-hooks.md          # Project pre-commit hooks + pipeline protection hooks
│       ├── pixel-agent.md            # Agent description naming convention
│       └── self-test.md              # Structural validation dry-run checklist
├── references/
│   ├── ojo-critico.md                # Critical reviewer prompt template
│   └── tool-risk-matrix.md           # Risk classification + taint tracking protocol
├── ct/methodologies/
│   └── catalog.json                  # 24 dev frameworks with bridge_compatibility scores
└── memory/
    ├── program.md                    # Karpathy Loop: what to evaluate (editable)
    ├── evaluate.ts                   # Post-project correlation script
    └── insights.json                 # Patterns from past projects (auto-updated)
```

### Core Agents (6 persistent agents)

| Agent | Role | Model | Key Tools |
|---|---|---|---|
| **requirements-translator** | Extracts structured requirements from unstructured input | Sonnet | Context7, sequential-thinking, memory |
| **researcher** | Fetches live docs, evaluates tools, APIs, MCPs | Sonnet | Context7, Playwright, memory, crawl4ai CLI |
| **solution-architect** | Designs architecture, specifies agent team | Opus | Context7, Playwright, Excalidraw, Serena, Greptile, azure/aws-pricing, uml, memory |
| **validator** | Goal-backward requirements verification | Opus | Context7, gitguardian, Serena, Greptile, code-review-graph, memory |
| **code-reviewer** | Code quality, test coverage, documentation | Sonnet | memory, eslint CLI |
| **security-auditor** | SAST, secrets, dependencies, OWASP Top 10 | Opus | gitguardian, memory, semgrep CLI |

### Dynamic Specialist Agents (created per project)

The Architect specifies which specialists are needed. The orchestrator creates them dynamically in Phase 4. Examples:

- `spec-netsuite-integrator`, `spec-quickbooks-integrator`, `spec-salesforce-integrator`
- `spec-etl-pipeline-engineer`, `spec-data-warehouse-engineer`, `spec-fabric-engineer`
- `spec-python-backend`, `spec-typescript-frontend`, `spec-fullstack-developer`
- `spec-azure-deploy`, `spec-terraform-engineer`, `spec-ml-engineer`

Each specialist includes: task definition, tools, methodology (TDD, security awareness), documentation access chain, completion signal, and quality checklist. Specialists persist between runs and accumulate knowledge via project memory.

---

## Complete Tool Stack

### MCP Servers (Model Context Protocol)

| MCP Server | Purpose | Phases | Required? |
|---|---|---|---|
| **context7** | Code library documentation (React, Node, Python packages) | 2, 3, 4 | Recommended |
| **playwright** | Browser automation, E2E testing, interactive doc sites | 2, 3, 4 | Recommended |
| **excalidraw** | Mermaid to PNG/SVG architecture diagrams with cloud icons | 3 | Optional |
| **sequential-thinking** | Structured step-by-step reasoning for Phase 1 | 1 | Optional |
| **uml** | Formal C4, BPMN, ERD, sequence diagrams | 3 | Optional |
| **memory** | Persistent knowledge graph across sessions and agents | All | Recommended |
| **azure-pricing** | Real Azure service pricing for cost models | 3 | Optional |
| **aws-pricing** | Real AWS service pricing for cost models | 3 | Optional |
| **gitguardian** | Secrets detection and credential scanning | 5 | Recommended |
| **serena** | LSP code intelligence: find_symbol, replace_symbol_body, rename_symbol | 3, 4, 5 | Optional |
| **greptile** | AI semantic code search (requires API key) | 3, 5 | Optional |
| **deepwiki** | AI-generated documentation from GitHub repos | 2, 3, 4 | Optional |
| **code-review-graph** | Codebase knowledge graph, blast radius, call graph | 4, 5 | Optional |

### CLI Tools

| CLI Tool | Purpose | Phases | Install |
|---|---|---|---|
| **crawl4ai** (`crwl`) | Web scraping to clean markdown — free, no auth | 2, 3, 4 | `pip install -U crawl4ai && crawl4ai-setup` |
| **semgrep** | SAST static analysis (OWASP Top 10, custom rules) | 4, 5 | `pip install semgrep` |
| **vitest** | Fast JS/TS test runner with coverage | 4 | `npm install -D vitest` |
| **eslint** | JavaScript/TypeScript linting and auto-fix | 4, 5 | `npm install -D eslint` |
| **lighthouse** | Performance, accessibility, SEO, best practices audit | 4, 5 | `npm install -g lighthouse` |
| **gh** | GitHub CLI for repos, PRs, issues, releases | All | `brew install gh` / `winget install GitHub.cli` |
| **stryker** | Mutation testing — verifies tests catch real bugs | 5 | Optional |
| **pixelmatch** | Visual regression via screenshot comparison | 4 | Optional |
| **pandoc** | Markdown to Word/PDF document conversion | 5 | `pip install pandoc` |
| **pptxgenjs** | PowerPoint generation from pipeline data | 5 | `npm install -g pptxgenjs` |
| **exceljs** | Excel generation from pipeline data | 5 | `npm install -g exceljs` |

### Claude Code Plugins

| Plugin | Purpose | Phases |
|---|---|---|
| **superpowers** | Methodology gateway: TDD, brainstorming, writing-plans, debugging, code review, verification, branch finishing | All |
| **pr-review-toolkit** | 6-pass deep code review (code, tests, silent failures, types, comments, simplification) | 5 |
| **code-review** | Auto-post review findings to GitHub PRs (Haiku scoring, Sonnet filtering, 80+ confidence) | 5 |
| **code-simplifier** | Post-build code cleanup and clarity improvements | 4 |
| **frontend-design** | Production-grade UI design guidance (not generic AI aesthetics) | 4 |
| **commit-commands** | Git workflow automation | 4 |
| **security-guidance** | Security warnings on file edits (hook) | 4, 5 |
| **feature-dev** | Guided feature development with quality gates | 4 |

### Trail of Bits Security Skills (32 of 35 active)

#### Always Active (8 skills — every run)

| Skill | Purpose | Phase |
|---|---|---|
| **static-analysis** | Deep SAST with CodeQL + Semgrep + SARIF integration | 5 |
| **supply-chain-risk-auditor** | Audit deps for CVEs, typosquatting, malicious packages | 5 |
| **entry-point-analyzer** | Map attack surface — all APIs, endpoints, user inputs | 3 |
| **audit-context-building** | Ultra-granular code analysis: modules, actors, storage, cross-function flows | 3, 5 |
| **sharp-edges** | Dangerous API patterns, risky library usage | 4 |
| **differential-review** | Compare final code vs original architecture plan | 5 |
| **insecure-defaults** | Flag insecure default configurations | 3 |
| **fp-check** | Systematic false positive verification for all SAST findings | 5 |

#### Triggered by Context (9 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **property-based-testing** | Critical business logic | 4 |
| **testing-handbook-skills** | Critical business logic (fuzzing, sanitizers) | 4 |
| **spec-to-code-compliance** | Brownfield projects or final validation | 3, 5 |
| **variant-analysis** | Vulnerability found — search for same pattern everywhere | 5 |
| **semgrep-rule-creator** | Vulnerability found — create project-specific rule | 5 |
| **semgrep-rule-variant-creator** | Multi-language project + custom rule created | 5 |
| **ask-questions-if-underspecified** | Ambiguous requirements | 1 |
| **second-opinion** | External LLM CLI available (Codex, Gemini) | 5 |
| **agentic-actions-auditor** | GitHub Actions CI/CD with AI agent steps | 5 |

#### Domain-Specific (5 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **building-secure-contracts** | Blockchain/Web3 — 20+ weird token patterns, platform-specific vulns | 3, 4, 5 |
| **constant-time-analysis** | Cryptographic operations — timing side-channels | 5 |
| **zeroize-audit** | Secrets/keys in memory — missing zeroization | 5 |
| **firebase-apk-scanner** | Android + Firebase — security misconfigurations | 5 |
| **seatbelt-sandboxer** | macOS/iOS — minimal Seatbelt sandbox profiles | 4 |

#### Supply Chain & Artifact Security (3 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **yara-authoring** | External scripts/tools/packages installed or artifacts scanned | 2, 4, 5 |
| **burpsuite-project-parser** | Pentest engagement results available | 5 |
| **dwarf-expert** | Compiled binary verification (C/C++/Rust) | 5 |

#### Development Tooling (6 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **modern-python** | Python project — enforces uv, ruff, ty, pytest | 4 |
| **devcontainer-setup** | Reproducible `.devcontainer/` for team onboarding | 4, delivery |
| **gh-cli** | GitHub URL access — enforces authenticated rate limits | All |
| **git-cleanup** | Post-pipeline branch cleanup | Post-5 |
| **workflow-skill-design** | Pipeline self-improvement and quality review | Meta |
| **skill-improver** | Quality refinement of dynamically created specialists | 4 |

#### Not Used (3 skills — genuinely out of scope)

| Skill | Reason |
|---|---|
| **let-fate-decide** | Entertainment (tarot spreads) |
| **culture-index** | HR/organizational — outside pipeline scope |
| **debug-buttercup** | Trail of Bits internal Kubernetes tool |

---

## Complete Process Detail

### Phase 0: Initialization

```
0.0  Tool & Resource Discovery
     ├── Detect installed plugins, MCPs, CLIs
     ├── Smart Plugin Check — compare installed vs recommended
     └── Auto-install missing CLIs (present plan, execute on approval)

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

0.5  Discuss Phase (optional — resolves ambiguities before pipeline starts)
0.6  Initialize Todo List
```

### Phase 0b: Codebase Analysis (conditional — brownfield projects)

```
Only if user references existing codebase:
├── Scan project structure and conventions
├── Identify technology stack and patterns
├── Map existing architecture
└── Feed findings into Phase 1 as constraints
```

### Phase 1: Translate

```
1.1  Spawn Requirements Translator
     ├── BRIDGE B-R-I-D analysis with Fishbone/Ishikawa root cause categorization
     │   (People / Process / Technology / Data / Environment / Measurement)
     └── Produces: 01-technical-definition.md + 01a-bridge-analysis.md

1.2  Ojo Critico Review (if config.critical_review=true)
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
     └── Write to .claude/agents/spec-{role}.md

4.2  Human Approval Gate (Team Review)
     └── Review specialist team before building starts

4.3  Execute Build Groups (Vertical Slice Execution)
     For each specialist, slice by slice:

     ┌─────────────────────────────────────────────────┐
     │  BUILD (TDD: red → green → refactor)            │
     │    ↓                                            │
     │  TEST (vitest run / pytest / framework-specific) │
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
     │  STRUCTURAL LINTER (orchestrator, no LLM):     │
     │    ├── File manifest compliance                 │
     │    ├── Import direction enforcement             │
     │    ├── Naming convention compliance             │
     │    ├── File size guard (>300 WARN, >500 ERROR)  │
     │    └── Test file presence check                 │
     │    ↓                                            │
     │  VERIFY: all tests pass + acceptance criteria?  │
     │    ├── YES → BRIDGE_SLICE_COMPLETE → next slice │
     │    └── NO → RETRY (max 3, then escalate)       │
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

4.7  Specialist Archival
     └── Successful specialists archived to .claude/agents/library/ for future reuse
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
     ├── Pass 1: Code reviewer — guidelines, bugs
     ├── Pass 2: Test analyzer — coverage quality
     ├── Pass 3: Silent failure hunter — empty catches, missing logs
     ├── Pass 4: Type design analyzer — encapsulation
     ├── Pass 5: Comment analyzer — accuracy
     ├── Pass 6: Code simplifier — simplification opportunities
     └── Produces: 05b-pr-review.md

5.1e Optional: Mutation Testing (stryker)
     └── Score >80% strong, 60-80% warning, <60% critical

5.2  Quality Score Calculation
     ├── requirements_coverage × 0.35
     ├── test_pass_rate × 0.25
     ├── security_score × 0.20
     ├── code_quality × 0.10
     └── documentation × 0.10
     Threshold: >=0.80 APPROVE, 0.60-0.79 CONDITIONAL, <0.60 REJECT

5.3  Rejection Loop (max 2 cycles)
     ├── Route issues to responsible agent with targeted feedback
     ├── Auto-fix or manual instructions
     └── Same issue 2+ times → escalate immediately

5.4  Human Approval Gate (Final)

5.5  Generate Deliverables
     ├── Internal: pipeline/ (full details)
     └── Client: deliverables/ (sanitized — no AI/agent references)

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
    a) Auto-fix — re-spawn responsible specialist with security feedback
    b) Manual fix — user provides guidance
    c) Accept risk — user must type "I accept the risk for: {finding}" (per finding)
    d) Abort delivery

config.security_gate = "advisory":
  Findings logged but do not block. User was warned.
```

---

## Agent-to-Tool Matrix

| Agent | Base Tools | MCP Tools | CLI Tools | Model |
|---|---|---|---|---|
| **Requirements Translator** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | Context7, sequential-thinking, memory | — | Sonnet |
| **Technology Researcher** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | Context7, Playwright (5 tools), memory | crawl4ai | Sonnet |
| **Solution Architect** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | Context7, Playwright (2), Excalidraw (4), Serena, Greptile, azure-pricing, aws-pricing, uml, memory | crawl4ai | Opus |
| **Code Specialists** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | Context7, Serena, code-review-graph, memory | vitest, eslint | Sonnet |
| **Python Specialists** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | Context7, Serena, code-review-graph, memory | uv, ruff, ty, pytest | Sonnet |
| **Frontend Specialists** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | Playwright (5), Serena, code-review-graph, memory | vitest, eslint, lighthouse | Sonnet |
| **Blockchain Specialists** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | Context7, Serena, memory | hardhat/foundry/anchor | Sonnet |
| **Infrastructure Specialists** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | Context7, memory | terraform/kubectl/docker/az/aws | Sonnet |
| **Validator** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | Context7, gitguardian, Serena, Greptile, code-review-graph, memory | semgrep, lighthouse | Opus |
| **Code Reviewer** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | memory | eslint | Sonnet |
| **Security Auditor** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | gitguardian, memory | semgrep | Opus |
| **De-Sloppify** | Read, Write, Edit, Glob, Grep, Bash | — | eslint | Haiku |

### Dynamic Dependency Resolution

When a specialist needs tools not in the base matrix:

| Dependency Type | Resolution | Blocking? |
|---|---|---|
| CLI tools | Auto-install via setup script (`scripts/setup-{role}.sh`) | Yes |
| npm packages | `npm install {package}` (project-local) | Yes |
| pip packages | `pip install {package}` (or `uv pip install`) | Yes |
| MCP servers | Add to agent tools if available; degrade gracefully if not | No |
| Trail of Bits skills | Invoke if installed; embed from reference docs if not | No |
| Helper scripts | Orchestrator creates before spawn; agent can create more at runtime | Yes |

---

## Documentation Access Chain (6 tiers)

```
llms.txt quick check (try FIRST)
  ↓ not found
Tier 1: Context7 MCP          → Code libraries (React, Node, Python packages)
  ↓ not a code library
Tier 2: DeepWiki MCP           → GitHub repo documentation (optional plugin)
  ↓ not a GitHub repo or not installed
Tier 3: crawl4ai CLI           → ANY online docs (NetSuite, Azure, Salesforce, SAP) — free
  ↓ can't render page
Tier 4: Playwright MCP         → Interactive/JS-heavy/auth-gated sites
  ↓ no browser needed
Tier 5: Context Hub CLI        → Curated API docs (Stripe, Twilio, AWS, 68+ APIs)
  ↓ all else fails
Tier 6: WebSearch + WebFetch   → Fallback
```

---

## What Gets Delivered

```
clients/{client}/{project}/
├── README.md                          # Project metadata and progress
├── input/
│   └── original-input.md             # Original requirements (preserved)
├── pipeline/                          # Internal artifacts (your team only)
│   ├── config.json                    # Pipeline configuration
│   ├── state.json                     # Pipeline state for resumability
│   ├── cost-log.json                  # Token/cost estimation per agent
│   ├── 00-constraints.md             # Locked decisions from discuss phase
│   ├── 01-technical-definition.md    # Requirements translation
│   ├── 01a-bridge-analysis.md        # Full BRIDGE B-R-I-D-G-E analysis
│   ├── 01c-critical-review.md        # Ojo Critico review (Phase 1)
│   ├── 02-research-report.md         # Technology research
│   ├── 02c-critical-review.md        # Ojo Critico review (Phase 2)
│   ├── 03-solution-proposal.md       # Architecture design
│   ├── 03b-plan-check.md            # Pre-build plan validation
│   ├── 03c-critical-review.md        # Ojo Critico review (Phase 3)
│   ├── 04-build-manifest.md          # Build status per specialist/slice
│   ├── 05-validation-report.md       # Validator assessment
│   ├── 05a-code-review.md           # Code review results
│   ├── 05b-pr-review.md             # 6-pass PR review results
│   ├── 05c-security-audit.md        # Security audit (BLOCKING)
│   ├── quality-score.json            # Composite quality score
│   ├── 03c-methodology-selection.md  # CT-selected development methodology
│   ├── ct-decisions.json             # Decision audit trail for self-improvement
│   ├── feedback-routing.json         # Issue routing for fix cycles
│   ├── improvements.tsv              # Fix attempt tracking
│   ├── error-log.md                  # Pipeline error history
│   ├── internal-summary.md           # Final summary with cost report
│   └── lessons/                       # Cross-run learnings
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
│   └── images/                        # Diagram exports (PNG/SVG)
└── brand-assets/                      # Your brand guidelines
    ├── brand-config.json             # Colors, fonts, logo
    └── templates/                     # PPTX, DOCX, CSS templates
```

Client deliverables are fully sanitized — no agent, pipeline, or AI system references. The `deliverables/` folder is independently shareable.

---

## Critical Thinking Integration

CT frameworks are applied as reference knowledge at key decision points — not as separate scripts or modules, but embedded in agent prompts where they add the most value.

| Phase | CT Framework | What It Does |
|---|---|---|
| **1 — Translate** | **Fishbone/Ishikawa** | Categorizes root causes into 6 dimensions: People, Process, Technology, Data, Environment, Measurement |
| **2 — Research** | **Force-Field Analysis** | Scores driving forces vs restraining forces (1-5) for each technology recommendation |
| **3 — Architect** | **SCAMPER** | Substitute, Combine, Eliminate checks prevent over-architecture before finalizing design |
| **3c — Methodology** | **Six Thinking Hats** | 6 perspectives (data, intuition, risks, benefits, creative, process) evaluate 24 development methodologies |
| **3c — Methodology** | **Force-Field** | Final scoring of top 2 methodology candidates with driving vs restraining forces |
| **4 — Build** | **Abductive Reasoning** | When data is incomplete, formulate 2-3 hypotheses ordered by plausibility, implement most plausible with verification |
| **1-3 Gates** | **Ojo Critico** | Skeptical review combining Paul-Elder intellectual standards with Watson-Glaser evaluation |
| **5 — Validate** | **Goal-Backward** | Dialectical: what conditions must be TRUE vs what IS true in the code |

### Self-Improvement (Karpathy Loop)

After each completed project, the pipeline evaluates its own decisions:
- Logs key decisions to `pipeline/ct-decisions.json` with phase, CT framework, confidence, and human override status
- `evaluate.ts` correlates CT decisions with quality outcomes
- Patterns confirmed across 3+ projects become insights in `memory/insights.json`
- Future projects use insights to select better methodologies and calibrate confidence
- `program.md` defines what to evaluate — editable, so you control the direction of improvement

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

### Pipeline Protection Hooks (Claude Code)

Optional safety net for the pipeline process itself:

| Hook | Detects |
|---|---|
| **Destructive Command Guard** | rm -rf, git push --force, DROP TABLE, kubectl delete |
| **Secrets in Output Guard** | AWS keys, API tokens, passwords in Write/Edit |
| **Scope Escape Guard** | File writes outside project path |

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
| **Context Budget** | 9 rules: file-bridge (never accumulate), phase refresh (re-read core.md at key points), prompt size guard (<750 words), emergency recovery. |
| **Cost Tracking** | Per-agent token/cost estimation (chars/4). Optional budget cap with 80% warning and 100% pause. |
| **Flexible Execution** | Run phases in any order, skip ahead, run in parallel with reconciliation. |
| **Cross-Run Lessons** | Failures requiring 2+ attempts generate lessons loaded automatically in future runs. |
| **Client Knowledge Graph** | Per-client isolation. Technology decisions, constraints, anti-patterns persist across projects. |
| **Ojo Critico** | Skeptical reviewer after Phases 1-3 catches issues before expensive build work. Default: REJECT. |
| **Analysis Paralysis Guard** | 5+ consecutive reads without writing → must explain or report BLOCKED. |
| **Deviation Rules** | Auto-fix bugs/safety; escalate architecture changes; skip scope creep. |
| **Self-Test** | `bridge self-test` validates all referenced files, templates, agents, and docs exist. |

---

## Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.com/claude-code) installed and authenticated
- Node.js 18+ and Python 3.10+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/josembuitron/bridge-agentic-pipeline.git
cd bridge-agentic-pipeline

# 2. Follow the setup guide
# See SETUP.md for plugin installation and CLI tool setup

# 3. Launch Claude Code and run the pipeline
claude
# Then type: /bridge
```

### First Run

When you invoke `/bridge`, the pipeline will:

1. **Discover tools** — detect installed tools, offer to install missing ones (never blocks on optional tools)
2. **Collect input** — paste text, provide file paths, or describe your project
3. **Confirm understanding** — validate client name, project name, and problem interpretation before creating folders
4. **Run phases** — each phase produces artifacts and waits for your approval

---

## Configuration

The pipeline creates `pipeline/config.json` in each project folder:

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "workflow": {
    "discuss_phase": false,
    "critical_review": true,
    "plan_checker": true,
    "de_sloppify": true,
    "mutation_testing": false,
    "visual_regression": false,
    "auto_advance": false
  },
  "parallelization": { "enabled": true, "max_concurrent_specialists": 3 },
  "security_gate": "blocking",
  "budget_cap_usd": null,
  "gates": {
    "after_translate": true,
    "after_research": true,
    "after_architecture": true,
    "per_slice": true,
    "after_validation": true
  }
}
```

| Setting | Options | Effect |
|---|---|---|
| `mode` | `interactive` / `yolo` | Approval gates at every phase vs. auto-advance |
| `granularity` | `coarse` / `standard` / `fine` | Fewer slices (faster) vs. more slices (thorough) |
| `model_profile` | `quality` / `balanced` / `budget` | Opus everywhere vs. mixed routing vs. Sonnet everywhere |
| `security_gate` | `blocking` / `advisory` | Critical findings block delivery vs. log only |
| `budget_cap_usd` | number / `null` | Cost cap with 80% warning and 100% pause |

### Project Type Presets

| Preset | Granularity | Key Flags |
|---|---|---|
| `api-integration` | standard | plan-checker ON, de-sloppify ON |
| `data-pipeline` | standard | plan-checker ON, security-gate blocking |
| `dashboard` | coarse | plan-checker OFF (simpler scope) |
| `enterprise-feature` | fine | discuss phase ON, all gates ON |
| `mvp-rapid` | coarse | plan-checker OFF, de-sloppify OFF, per-slice gates OFF |

### Brand Assets

Place your brand guidelines in `brand-assets/` to customize all deliverable output:

```json
{
  "company": "Your Company",
  "colors": { "primary": "#003366", "secondary": "#0066CC", "accent": "#FF6600" },
  "fonts": { "heading": "Georgia, serif", "body": "Calibri, sans-serif" },
  "logo_path": "logo.png"
}
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
- **>= 0.80** — APPROVE
- **0.60 - 0.79** — CONDITIONAL APPROVE (specific improvements listed)
- **< 0.60** — REJECT (routed back to responsible agent with targeted feedback)

---

## Repository Layout

```
bridge-agentic-pipeline/
├── .claude/agents/      # Core agent definitions (6 agents)
├── .claude/commands/    # Slash command entry point (/bridge)
├── .claude-plugin/      # Plugin metadata (for marketplace distribution)
├── agents/              # Agent definitions (plugin distribution copy)
├── skills/bridge/       # Pipeline orchestrator (SKILL.md + modular phases/modules)
├── templates/           # Output format templates (5 templates)
├── docs/                # Domain knowledge (3 docs) + CLI reference (6 docs)
├── CLAUDE.md            # Project-level Claude Code instructions
├── SETUP.md             # Detailed setup, installation, and usage tips
├── DISCLAIMER.md        # Legal disclaimer for AI-generated outputs
├── LICENSE              # MIT License
└── README.md            # This file
```

---

## License

MIT License.

---

## Support

If Bridge saves you time, consider supporting the project:

<a href="https://www.buymeacoffee.com/josembuitron" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

**Repository:** [github.com/josembuitron/bridge-agentic-pipeline](https://github.com/josembuitron/bridge-agentic-pipeline)

**Questions or feedback?** [Open an issue on GitHub](https://github.com/josembuitron/bridge-agentic-pipeline/issues).
