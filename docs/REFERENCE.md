# BRIDGE Reference

[← Back to README](../README.md)

Complete catalog of every tool, plugin, MCP server, security skill, and integration the pipeline can use. The README links here from the tool stack overview.

---

## MCP Servers (Model Context Protocol)

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

## CLI Tools

| CLI Tool | Purpose | Phases | Install |
|---|---|---|---|
| **crawl4ai** (`crwl`) | Web scraping to clean markdown -- free, no auth | 2, 3, 4 | `pip install -U crawl4ai && crawl4ai-setup` |
| **semgrep** | SAST static analysis (OWASP Top 10, custom rules) | 4, 5 | `pip install semgrep` |
| **vitest** | Fast JS/TS test runner with coverage | 4 | `npm install -D vitest` |
| **eslint** | JavaScript/TypeScript linting and auto-fix | 4, 5 | `npm install -D eslint` |
| **lighthouse** | Performance, accessibility, SEO, best practices audit | 4, 5 | `npm install -g lighthouse` |
| **gh** | GitHub CLI for repos, PRs, issues, releases | All | `brew install gh` / `winget install GitHub.cli` |
| **stryker** | Mutation testing -- verifies tests catch real bugs | 5 | Optional |
| **pixelmatch** | Visual regression via screenshot comparison | 4 | Optional |
| **pandoc** | Markdown to Word/PDF document conversion | 5 | Install per https://pandoc.org/installing.html |
| **pptxgenjs** | PowerPoint generation from pipeline data | 5 | `npm install -g pptxgenjs` |
| **exceljs** | Excel generation from pipeline data | 5 | `npm install -g exceljs` |

Run `node scripts/bridge.js doctor` (or `bridge doctor` after `npm link`) to detect which tools are present on your system and which are missing.

## Claude Code Plugins

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

## Trail of Bits Security Skills (32 of 35 active)

### Always Active (8 skills -- every run)

| Skill | Purpose | Phase |
|---|---|---|
| **static-analysis** | Deep SAST with CodeQL + Semgrep + SARIF integration | 5 |
| **supply-chain-risk-auditor** | Audit deps for CVEs, typosquatting, malicious packages | 5 |
| **entry-point-analyzer** | Map attack surface -- all APIs, endpoints, user inputs | 3 |
| **audit-context-building** | Ultra-granular code analysis: modules, actors, storage, cross-function flows | 3, 5 |
| **sharp-edges** | Dangerous API patterns, risky library usage | 4 |
| **differential-review** | Compare final code vs original architecture plan | 5 |
| **insecure-defaults** | Flag insecure default configurations | 3 |
| **fp-check** | Systematic false positive verification for all SAST findings | 5 |

### Triggered by Context (9 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **property-based-testing** | Critical business logic | 4 |
| **testing-handbook-skills** | Critical business logic (fuzzing, sanitizers) | 4 |
| **spec-to-code-compliance** | Brownfield projects or final validation | 3, 5 |
| **variant-analysis** | Vulnerability found -- search for same pattern everywhere | 5 |
| **semgrep-rule-creator** | Vulnerability found -- create project-specific rule | 5 |
| **semgrep-rule-variant-creator** | Multi-language project + custom rule created | 5 |
| **ask-questions-if-underspecified** | Ambiguous requirements | 1 |
| **second-opinion** | External LLM CLI available (Codex, Gemini) | 5 |
| **agentic-actions-auditor** | GitHub Actions CI/CD with AI agent steps | 5 |

### Domain-Specific (5 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **building-secure-contracts** | Blockchain/Web3 -- 20+ weird token patterns, platform-specific vulns | 3, 4, 5 |
| **constant-time-analysis** | Cryptographic operations -- timing side-channels | 5 |
| **zeroize-audit** | Secrets/keys in memory -- missing zeroization | 5 |
| **firebase-apk-scanner** | Android + Firebase -- security misconfigurations | 5 |
| **seatbelt-sandboxer** | macOS/iOS -- minimal Seatbelt sandbox profiles | 4 |

### Supply Chain & Artifact Security (3 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **yara-authoring** | External scripts/tools/packages installed or artifacts scanned | 2, 4, 5 |
| **burpsuite-project-parser** | Pentest engagement results available | 5 |
| **dwarf-expert** | Compiled binary verification (C/C++/Rust) | 5 |

### Development Tooling (6 skills)

| Skill | Trigger | Phase |
|---|---|---|
| **modern-python** | Python project -- enforces uv, ruff, ty, pytest | 4 |
| **devcontainer-setup** | Reproducible `.devcontainer/` for team onboarding | 4, delivery |
| **gh-cli** | GitHub URL access -- enforces authenticated rate limits | All |
| **git-cleanup** | Post-pipeline branch cleanup | Post-5 |
| **workflow-skill-design** | Pipeline self-improvement and quality review | Meta |
| **skill-improver** | Quality refinement of dynamically created specialists | 4 |

### Not Used (3 skills -- out of scope)

| Skill | Reason |
|---|---|
| **let-fate-decide** | Entertainment (tarot spreads) |
| **culture-index** | HR/organizational -- outside pipeline scope |
| **debug-buttercup** | Trail of Bits internal Kubernetes tool |

---

## Agent-to-Tool Matrix

| Agent | Base Tools | MCP Tools | CLI Tools | Model |
|---|---|---|---|---|
| **Requirements Translator** | Read, Write, Glob, Grep, Bash, WebSearch, WebFetch | Context7, sequential-thinking, memory | -- | Sonnet |
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
| **De-Sloppify** | Read, Write, Edit, Glob, Grep, Bash | -- | eslint | Haiku |

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
Tier 3: crawl4ai CLI           → ANY online docs (NetSuite, Azure, Salesforce, SAP) -- free
  ↓ can't render page
Tier 4: Playwright MCP         → Interactive/JS-heavy/auth-gated sites
  ↓ no browser needed
Tier 5: Context Hub CLI        → Curated API docs (Stripe, Twilio, AWS, 68+ APIs)
  ↓ all else fails
Tier 6: WebSearch + WebFetch   → Fallback
```
