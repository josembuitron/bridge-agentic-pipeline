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

## Architecture Highlights

### Security Shift-Left
Security is not a Phase 5 afterthought. Semgrep SAST runs after **every build slice**, not just at the end. Trail of Bits skills scan for insecure defaults during architecture (Phase 3), dangerous API patterns during build (Phase 4), and supply-chain vulnerabilities during validation (Phase 5). GitGuardian scans for exposed secrets before delivery.

### Test-Driven Development with Hardening
Every code slice follows a strict cycle:

```
BUILD (TDD: red-green-refactor)
  -> TEST (vitest run)
    -> HARDEN (error paths, boundaries, concurrency, invalid input)
      -> E2E (Playwright smoke test for frontend slices)
        -> VERIFY (all tests pass + acceptance criteria met)
```

Specialists write both the TDD tests and hardened tests. The Validator evaluates sufficiency but never writes tests — separation of concerns.

### Vertical Slicing
The Architect decomposes work into ordered vertical slices following **walking skeleton methodology**. Slice 1 is always the thinnest possible end-to-end proof. Each subsequent slice adds a complete, testable increment. If the pipeline stops at any slice, you have working (thin) functionality — not broken layers.

### Ojo Critico (Critical Reviewer)
After Phases 1, 2, and 3, a skeptical senior reviewer agent challenges the output before it reaches you. Default posture: **REJECT**. It catches missed requirements, unverified claims, unrealistic costs, and hidden dependencies — before expensive build work begins.

### Goal-Backward Verification
Phase 5 does not ask "did we complete all tasks?" It asks **"what must be TRUE for the business goal to be achieved?"** and works backward. Stub detection catches empty function bodies, orphaned components, and routes that exist but do nothing.

### Plan-Checker
Between Phase 3 and Phase 4, a plan-checker validates 7 dimensions: requirement coverage, dependency ordering, key integration links, scope sanity, test coverage, integration gaps, and BRIDGE alignment.

### Configuration System
Interactive or YOLO mode. Three model profiles (quality / balanced / budget). Feature flags for every workflow step. Project type presets (`api-integration`, `data-pipeline`, `dashboard`, `enterprise-feature`, `mvp-rapid`). Per-phase approval gates that can be individually toggled.

### Cross-Run Lessons
The pipeline captures lessons from failures and successes. Future runs load these lessons automatically, preventing the same mistakes across projects. Lessons are compact and specific — not vague platitudes.

### Deviation Rules
Specialists auto-fix bugs, safety gaps, and blocking dependencies without asking. Architecture changes require escalation. Scope creep is skipped and noted. This keeps the build moving without silent drift.

### Analysis Paralysis Guard
If any agent makes 5+ consecutive read calls without writing anything, it must stop, explain what it is looking for, and either produce output or report BLOCKED.

### Stall Detection
Every specialist emits a `BRIDGE_SLICE_COMPLETE` signal on success. The orchestrator monitors for missing signals, error keywords, and timeout conditions. Walking skeleton failures escalate immediately — they indicate an architecture problem, not a code problem.

---

## Plugin Ecosystem

### Core Methodology

| Plugin | What It Provides | Phases |
|---|---|---|
| **superpowers** | TDD, brainstorming, writing-plans, debugging, verification | All |
| **context7** (MCP) | Code library documentation | 2, 3, 4 |
| **playwright** (MCP) | Browser automation, E2E testing, visual verification | 2, 3, 4 |
| **sequential-thinking** (MCP) | Structured step-by-step reasoning | 1 |
| **memory** (MCP) | Persistent knowledge graph across sessions | All |

### Security

| Plugin | What It Provides | Phases |
|---|---|---|
| **Trail of Bits** (32 of 35 skills) | Security: entry-point analysis, insecure defaults, sharp-edges, static analysis, supply-chain audit, YARA malware scanning, DWARF binary verification. Quality: differential review, variant analysis, property-based testing, spec-to-code compliance. Tooling: modern-python, devcontainer-setup, skill-improver, workflow-skill-design. Pentest: Burp Suite parser | All |
| **semgrep** (CLI) | SAST scanning (OWASP Top 10) — per-slice and full-codebase | 4, 5 |
| **gitguardian** (MCP) | Secrets detection and credential scanning | 5 |
| **security-guidance** | Security warnings on file edits (hook) | 4, 5 |

### Code Quality

| Plugin | What It Provides | Phases |
|---|---|---|
| **pr-review-toolkit** | 6-pass deep review: code, tests, silent failures, types, comments, simplification | 5 |
| **code-review** | Auto-post review comments to GitHub PRs | 5 |
| **code-simplifier** | Post-build cleanup and clarity improvements | 4 |
| **serena** (MCP) | LSP-powered symbol navigation, precise edits, cross-file refactoring | 3, 4, 5 |
| **code-review-graph** (CLI) | Codebase knowledge graph, blast radius, call graph analysis | 4, 5 |
| **eslint** (CLI) | JavaScript/TypeScript linting and auto-fix | 4 |

### Testing

| Plugin | What It Provides | Phases |
|---|---|---|
| **vitest** (CLI) | Fast JS/TS test runner with coverage | 4 |
| **stryker** (CLI) | Mutation testing — verifies tests catch real bugs | 5 (optional) |
| **pixelmatch** (CLI) | Visual regression detection via screenshot comparison | 4 (optional) |
| **property-based-testing** (ToB) | Edge-case test generation beyond unit tests | 4 |

### Documentation and Research

| Plugin | What It Provides | Phases |
|---|---|---|
| **crawl4ai** (CLI) | Web scraping to clean markdown — free, no auth needed | 2, 3, 4 |
| **lighthouse** (CLI) | Performance, accessibility, SEO auditing | 4, 5 |
| **context-hub** (CLI) | Curated API documentation (68+ APIs) | 2 |

### Cloud Pricing

| Plugin | What It Provides | Phases |
|---|---|---|
| **azure-pricing** (MCP) | Real Azure service pricing for cost estimation | 3 |
| **aws-pricing** (MCP) | Real AWS service pricing for cost estimation | 3 |

### Diagrams

| Plugin | What It Provides | Phases |
|---|---|---|
| **excalidraw** (MCP) | Mermaid to PNG/SVG with cloud platform icons | 3 |
| **uml** (MCP) | Formal C4, BPMN, ERD, sequence diagrams | 3 |

---

## Agent-to-Tool Matrix

| Agent | Base Tools | MCP Tools | CLI Tools | Model |
|---|---|---|---|---|
| **Requirements Translator** | Read, Write, Glob, Grep, Bash | Context7, sequential-thinking, memory | — | Sonnet |
| **Technology Researcher** | Read, Write, Glob, Grep, Bash, WebSearch | Context7, Playwright, memory | crawl4ai | Sonnet |
| **Solution Architect** | Read, Write, Glob, Grep, Bash, WebSearch | Context7, Playwright, Excalidraw, Serena, azure-pricing, aws-pricing, uml, memory | crawl4ai | Opus |
| **Code Specialists** | Read, Write, Edit, Bash, Glob, Grep | Context7, Serena, code-review-graph, memory | vitest, eslint | Sonnet |
| **Frontend Specialists** | Read, Write, Edit, Bash, Glob, Grep | Playwright, Serena, code-review-graph, memory | vitest, eslint, lighthouse | Sonnet |
| **Validator** | Read, Write, Glob, Grep, Bash, WebSearch | Context7, gitguardian, Serena, code-review-graph, memory | semgrep, lighthouse | Opus |
| **De-Sloppify** | Read, Write, Edit, Glob, Grep, Bash | — | eslint | Haiku |

---

## What Gets Delivered

```
clients/{client}/{project}/
├── README.md                          # Project metadata and progress
├── input/
│   └── original-input.md             # Original requirements (preserved)
├── pipeline/                          # Internal artifacts (your team only)
│   ├── config.json                    # Pipeline configuration
│   ├── 00-constraints.md             # Locked decisions from discuss phase
│   ├── 01-technical-definition.md    # Requirements translation
│   ├── 01a-bridge-analysis.md        # Full BRIDGE B-R-I-D-G-E analysis
│   ├── 01c-critical-review.md        # Ojo Critico review
│   ├── 02-research-report.md         # Technology research
│   ├── 03-solution-proposal.md       # Architecture design
│   ├── 03b-plan-check.md            # Pre-build plan validation
│   ├── 04-build-manifest.md          # Build status per specialist/slice
│   ├── 05-validation-report.md       # Validator assessment
│   ├── 05b-pr-review.md             # 6-pass code review results
│   ├── quality-score.json            # Composite quality score
│   ├── feedback-routing.json         # Issue routing for fix cycles
│   ├── improvements.tsv              # Fix attempt tracking
│   └── lessons/                       # Cross-run learnings
├── src/                               # Built solution code
├── tests/                             # Test suites
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

## Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.com/claude-code) installed and authenticated
- Node.js 18+ and Python 3.10+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/josembuitron/bridge-agentic-pipeline.git
cd bridge-agentic-pipeline

# 2. Run setup (installs CLI tools and configures plugins)
# Follow the steps in SETUP.md

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

### Commands

```
/bridge                    Start a new project or continue existing
/bridge help               Show setup guide and configuration options
/bridge list               List all client projects
```

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
| `discuss_phase` | `true` / `false` | Pre-analysis conversation to resolve ambiguities |
| `critical_review` | `true` / `false` | Ojo Critico reviewer after Phases 1-3 |
| `plan_checker` | `true` / `false` | Pre-build validation across 7 dimensions |
| `de_sloppify` | `true` / `false` | Post-build code cleanup pass |
| `mutation_testing` | `true` / `false` | Stryker mutation testing for critical logic |
| `visual_regression` | `true` / `false` | Pixelmatch screenshot comparison for UI |

### Project Type Presets

| Preset | Granularity | Key Flags |
|---|---|---|
| `api-integration` | standard | plan-checker ON, de-sloppify ON |
| `data-pipeline` | standard | plan-checker ON, nyquist ON |
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

Add branded `.pptx` and `.docx` templates to `brand-assets/templates/` for Word and PowerPoint generation.

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
├── skills/              # SKILL.md files (pipeline orchestrator logic)
├── agents/              # Agent definitions (translator, researcher, architect, validator)
├── templates/           # Output format templates (technical-definition, solution-proposal, etc.)
├── docs/                # Domain knowledge documents
├── hooks/               # Claude Code hooks (security-guidance on edits)
├── CLAUDE.md            # Project-level Claude Code instructions
├── SETUP.md             # Detailed setup and installation guide
└── README.md            # This file
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Support

If Bridge saves you time, consider supporting the project:

<a href="https://www.buymeacoffee.com/josembuitron" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

**Repository:** [github.com/josembuitron/bridge-agentic-pipeline](https://github.com/josembuitron/bridge-agentic-pipeline)

**Questions or feedback?** [Open an issue on GitHub](https://github.com/josembuitron/bridge-agentic-pipeline/issues).
