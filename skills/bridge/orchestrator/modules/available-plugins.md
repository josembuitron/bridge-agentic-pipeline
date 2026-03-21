# Available Plugins & Tools Reference

Comprehensive reference of all plugins, MCP servers, and CLI tools the orchestrator should know about. Read this during Step 0.0c (Smart Plugin Check) and when assigning tools to agents.

## Claude Code Plugins (built-in)

| Plugin | What it provides | When to use | Priority |
|--------|-----------------|-------------|----------|
| **superpowers** | TDD, brainstorming, writing-plans, code-review, debugging, verification methodology | Methodology guidance for any agent (via orchestrator Skill gateway) | CRITICAL |
| **pr-review-toolkit** | 6-pass deep PR review (comments, tests, errors, types, code, simplify) | Phase 5 — orchestrator runs after Validator | CRITICAL |
| **context7** | Code library documentation MCP | Phase 2, 3, 4 — code library docs | HIGH |
| **playwright** | Browser automation MCP (navigate, snapshot, click, type, screenshot) | Phase 2, 3, 4 — interactive site browsing | HIGH |
| **code-review** | Auto-post review findings to GitHub PRs (Haiku→Sonnet scoring, 80+ confidence) | Phase 5 — if project uses GitHub PRs | HIGH |
| **serena** | LSP code intelligence: find_symbol, find_referencing_symbols, replace_symbol_body, rename_symbol, get_symbols_overview | Phase 3, 4, 5 — precise symbol navigation, cross-file refactoring | HIGH |
| **excalidraw** | Architecture diagram image generation (Mermaid to PNG/SVG via MCP, cloud icons) | Phase 3 — convert Mermaid diagrams to images for deliverables | MEDIUM |
| **code-simplifier** | Code quality and simplification suggestions | Phase 4 — post-build cleanup | MEDIUM |
| **frontend-design** | Production-grade UI design guidance (distinctive, not generic AI aesthetics) | Phase 4 — frontend specialist prompts | MEDIUM |
| **commit-commands** | Git workflow automation | Phase 4 — all code-writing agents | MEDIUM |
| **security-guidance** | Security warnings on file edits (hook) | Automatic for all code edits | MEDIUM |
| **github** | GitHub integration (PRs, issues, checks) | If project uses GitHub | MEDIUM |
| **supabase** | Supabase backend integration | If project uses Supabase | LOW |
| **pyright-lsp** | Python type checking via LSP | Python specialists | LOW |
| **greptile** | AI code review + semantic code search via MCP (requires API key) | Phase 3, 5 — codebase understanding | LOW |
| **sourcegraph** | Cross-repo code search (requires Sourcegraph instance) | Phase 3, 5 — multi-repo analysis | LOW |

## Trail of Bits Security Skills (35 total, key ones listed)

| Skill | What it does | When to use | Priority |
|-------|-------------|-------------|----------|
| **static-analysis** | Deep SAST with semgrep parallel workers + heuristic analysis | Phase 5 — deep security audit | HIGH |
| **supply-chain-risk-auditor** | Audit npm/pip/cargo deps for CVEs, typosquatting, malicious packages | Phase 5 — dependency audit | HIGH |
| **entry-point-analyzer** | Map attack surface — identify all APIs, endpoints, user inputs | Phase 3 — architecture threat modeling | MEDIUM |
| **sharp-edges** | Identifies dangerous API patterns, risky library usage | Phase 4 — embed in specialist prompts | MEDIUM |
| **differential-review** | Compare final code vs original plan — catch unintended drift | Phase 5 — code drift detection | MEDIUM |
| **property-based-testing** | Generate property-based tests for edge cases unit tests miss | Phase 4 — critical business logic | MEDIUM |
| **insecure-defaults** | Flag technology/framework insecure default configurations | Phase 3 — architecture review | MEDIUM |
| **variant-analysis** | If vuln found in one place, search for same pattern everywhere | Phase 5 — when a vulnerability is found | MEDIUM |

## MCP Servers (installed)

| MCP Server | What it provides | When to use |
|------------|-----------------|-------------|
| **azure-pricing** | Real Azure service pricing and cost estimation | Phase 3 — accurate Azure cost models for proposals |
| **aws-pricing** | Real AWS service pricing and cost estimation | Phase 3 — accurate AWS cost models for proposals |
| **sequential-thinking** | Structured step-by-step reasoning | Phase 1 — structured BRIDGE analysis |
| **uml** | Formal UML diagram generation (C4, BPMN, ERD, sequence) | Phase 3 — formal architecture diagrams |
| **memory** | Persistent knowledge graph across sessions | All agents — store/retrieve project facts and decisions |
| **gitguardian** | Secrets detection and credential scanning | Phase 5 — scan for exposed secrets before delivery |

## CLI Tools (installed)

| CLI Tool | What it provides | When to use | Reference |
|----------|-----------------|-------------|-----------|
| **crawl4ai** (`crwl`) | Web scraping to clean markdown (free, local, no auth) | Phase 2 — primary doc access tool | `docs/reference/crawl4ai.md` |
| **semgrep** | SAST static analysis (OWASP Top 10) | Phase 4 (per-slice), Phase 5 (full scan) | `docs/reference/semgrep.md` |
| **vitest** | Fast JS/TS test runner with coverage | Phase 4 — TDD test execution | `docs/reference/vitest.md` |
| **eslint** | JS/TS code quality linting and auto-fix | Phase 4 — code standards enforcement | `docs/reference/eslint.md` |
| **lighthouse** | Performance, accessibility, SEO, best practices | Phase 5 — frontend audit | `docs/reference/lighthouse.md` |
| **gh** | GitHub CLI for repos, PRs, issues, releases | All phases — GitHub operations | `docs/reference/gh-cli.md` |
| **code-review-graph** | Codebase knowledge graph — blast radius, call graph, semantic search | Phase 4, 5 — query code structure | — |
| **stryker** | Mutation testing — verifies tests catch real bugs | Phase 5 — critical business logic (optional) | — |
| **pixelmatch** | Pixel-by-pixel screenshot comparison | Phase 4 — visual regression (optional) | — |

## Smart Plugin Check (Step 0.0c)

During initialization, compare installed plugins against the recommended list above. Only show gaps to the user. If all CRITICAL and HIGH priority plugins are installed, just say `Plugins: all recommended ✅` and move on.

**Auto-install is NOT possible for plugins** — they require interactive `claude plugin marketplace add`. The orchestrator can only INFORM the user.

**CLI tools CAN be auto-installed** — present a single install plan and execute in one Bash command.
