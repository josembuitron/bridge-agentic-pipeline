# Available Plugins & Tools Reference

Comprehensive reference of all plugins, MCP servers, and CLI tools the orchestrator should know about. Read this during Step 0.0c (Smart Plugin Check) and when assigning tools to agents.

## Claude Code Plugins (built-in)

| Plugin | What it provides | When to use | Priority |
|--------|-----------------|-------------|----------|
| **superpowers** | Methodology guidance via orchestrator Skill gateway. Sub-skills: `superpowers:brainstorming` (creative problem-solving), `superpowers:writing-plans` (structured planning), `superpowers:test-driven-development` (TDD red-green-refactor), `superpowers:code-review` (code quality review), `superpowers:systematic-debugging` (root cause diagnosis), `superpowers:verification-before-completion` (pre-delivery checks), `superpowers:finishing-a-development-branch` (branch cleanup & PR prep) | CRITICAL -- sub-skills invoked by phase (see cross-skill-activation.md) | CRITICAL |
| **pr-review-toolkit** | 6-pass deep PR review (comments, tests, errors, types, code, simplify) | Phase 5 -- orchestrator runs after Validator | CRITICAL |
| **context7** | Code library documentation MCP | Phase 2, 3, 4 -- code library docs | HIGH |
| **playwright** | Browser automation MCP (navigate, snapshot, click, type, screenshot) | Phase 2, 3, 4 -- interactive site browsing | HIGH |
| **code-review** | Auto-post review findings to GitHub PRs (Haiku→Sonnet scoring, 80+ confidence). NOTE: This is the `code-review` _plugin_ (GitHub PR posting), distinct from `superpowers:code-review` (methodology guidance) | Phase 5 -- if project uses GitHub PRs | HIGH |
| **serena** | LSP code intelligence: find_symbol, find_referencing_symbols, replace_symbol_body, rename_symbol, get_symbols_overview | Phase 3, 4, 5 -- precise symbol navigation, cross-file refactoring | HIGH |
| **excalidraw** | Architecture diagram image generation (Mermaid to PNG/SVG via MCP, cloud icons). Now third in priority chain -- see `modules/architecture-diagrams.md` | Phase 3 -- fallback if `diagrams` (Python) and D2 are unavailable | MEDIUM |
| **code-simplifier** | Code quality and simplification suggestions | Phase 4 -- post-build cleanup | MEDIUM |
| **frontend-design** | Production-grade UI design guidance (distinctive, not generic AI aesthetics) | Phase 4 -- frontend specialist prompts | MEDIUM |
| **commit-commands** | Git workflow automation | Phase 4 -- all code-writing agents | MEDIUM |
| **security-guidance** | Security warnings on file edits (hook) | Automatic for all code edits | MEDIUM |
| **github** | GitHub integration (PRs, issues, checks) | If project uses GitHub | MEDIUM |
| **feature-dev** | Guided feature development with quality gates | Phase 4 -- complex specialist tasks | MEDIUM |
| **supabase** | Supabase backend integration | If project uses Supabase | LOW |
| **pyright-lsp** | Python type checking via LSP | Python specialists | LOW |
| **codex** (openai) | Cross-LLM code review: `/codex:review`, `/codex:adversarial-review`, `/codex:rescue` (delegate tasks). Stop hook (opt-in) gates output with Codex review. Requires codex CLI + ChatGPT account or OpenAI API key. | Phase 5 -- cross-LLM adversarial review | MEDIUM |
| **second-opinion** (ToB) | External LLM review orchestration (Codex + Gemini CLI). Auto-detects available CLIs, runs review, returns findings. Also provides Codex MCP tools (`codex`, `codex-reply`). | Phase 5 -- cross-LLM review fallback | MEDIUM |
| **greptile** | AI code review + semantic code search via MCP. NO free tier ($30/dev/mo). NOT RECOMMENDED -- use code-review-graph MCP, serena, or grep instead. | Phase 3, 5 -- codebase understanding | LOW |
| **sourcegraph** | Cross-repo code search (requires Sourcegraph instance) | Phase 3, 5 -- multi-repo analysis | LOW |

## Trail of Bits Security Skills (35 total -- ALL cataloged)

### Always Active (8 skills -- invoked every run)

| Skill | What it does | Phase | Priority |
|-------|-------------|-------|----------|
| **static-analysis** | Deep SAST with CodeQL + Semgrep + SARIF integration | 5 | HIGH |
| **supply-chain-risk-auditor** | Audit npm/pip/cargo deps for CVEs, typosquatting, malicious packages | 5 | HIGH |
| **entry-point-analyzer** | Map attack surface -- identify all APIs, endpoints, user inputs | 3 | HIGH |
| **audit-context-building** | Ultra-granular code analysis: modules, entrypoints, actors, storage, cross-function flows | 3, 5 | HIGH |
| **sharp-edges** | Identifies dangerous API patterns, risky library usage | 4 | MEDIUM |
| **differential-review** | Compare final code vs original plan -- catch unintended drift | 5 | MEDIUM |
| **insecure-defaults** | Flag technology/framework insecure default configurations | 3 | MEDIUM |
| **fp-check** | Systematic false positive verification gate for all SAST findings | 5 | MEDIUM |

### Triggered by Context (9 skills -- invoked based on project type)

| Skill | What it does | Phase | Trigger |
|-------|-------------|-------|---------|
| **property-based-testing** | Generate property-based tests for edge cases unit tests miss | 4 | Critical business logic |
| **testing-handbook-skills** | Fuzzing, sanitizers, harness-writing beyond unit tests | 4 | Critical business logic |
| **spec-to-code-compliance** | Evidence-based alignment analysis: spec vs implementation | 3, 5 | Brownfield projects or final validation |
| **variant-analysis** | If vuln found, search for same pattern across entire codebase | 5 | Vulnerability found |
| **semgrep-rule-creator** | Create production-quality Semgrep rules for project-specific patterns | 5 | Vulnerability found |
| **semgrep-rule-variant-creator** | Port existing Semgrep rules to new target languages | 5 | Multi-language project + custom rule created |
| **ask-questions-if-underspecified** | Force clarification on ambiguous requirements | 1 | Always (requirements phase) |
| **second-opinion** | Code review using external LLM CLIs (Codex, Gemini) | 5 | External LLM CLI available |
| **agentic-actions-auditor** | Audit GitHub Actions for AI agent workflow vulnerabilities | 5 | GitHub Actions CI/CD with AI agent steps |

### Domain-Specific (5 skills -- invoked for specific project types)

| Skill | What it does | Phase | Trigger |
|-------|-------------|-------|---------|
| **building-secure-contracts** | Smart contract security: 20+ weird token patterns, platform-specific vuln detection | 3, 4, 5 | Blockchain/Web3 project |
| **constant-time-analysis** | Detect compiler-induced timing side-channels in crypto code | 5 | Code handles cryptographic operations |
| **zeroize-audit** | Detect missing/compiler-optimized zeroization of sensitive data | 5 | Code handles secrets/keys in memory |
| **firebase-apk-scanner** | Scan Android APKs for Firebase security misconfigurations | 5 | Android + Firebase project |
| **seatbelt-sandboxer** | Generate minimal Seatbelt sandbox profiles | 4 | macOS/iOS app with sandboxing |

### Supply Chain & Artifact Security (3 skills -- invoked for dependency/artifact protection)

| Skill | What it does | Phase | Trigger |
|-------|-------------|-------|---------|
| **yara-authoring** | Create YARA-X detection rules for malicious patterns in scripts, skills, packages, or artifacts downloaded during pipeline | 2, 4, 5 | Any external script/tool/skill installed; new npm/pip packages added; untrusted artifact scanning |
| **burpsuite-project-parser** | Parse Burp Suite pentest reports to extract findings and feed them into validation | 5 | Project includes pentest engagement results; API security validation |
| **dwarf-expert** | Analyze DWARF debug info in compiled binaries to verify integrity and detect tampering | 5 | Project produces or consumes compiled binaries; C/C++/Rust build output verification |

### Development Tooling (6 skills -- invoked for environment and workflow optimization)

| Skill | What it does | Phase | Trigger |
|-------|-------------|-------|---------|
| **modern-python** | Enforces uv, ruff, ty, pytest ecosystem; intercepts legacy pip/python commands | 4 | Any Python project (replaces setup.py/requirements.txt fragmentation) |
| **devcontainer-setup** | Generates reproducible `.devcontainer/` configs for the built solution | 4, delivery | Client requests reproducible environment; team onboarding deliverable |
| **gh-cli** | Intercepts unauthenticated GitHub API calls; enforces 5,000/hr authenticated rate limit | All | Always active when accessing GitHub URLs (prevents 60/hr rate limit failures) |
| **git-cleanup** | Categorizes and safely cleans accumulated branches after pipeline runs | Post-5 | Pipeline complete; accumulated feature/specialist branches need cleanup |
| **workflow-skill-design** | Audits and improves BRIDGE pipeline skill structure; detects anti-patterns | Meta | Orchestrator self-improvement; pipeline quality review |
| **skill-improver** | Iterative quality refinement of dynamically created specialist agents | 4 | After specialist agent creation; quality gate before spawning |

### Environment Troubleshooting (1 skill -- invoked when browser tools fail)

| Skill | What it does | Phase | Trigger |
|-------|-------------|-------|---------|
| **claude-in-chrome-troubleshooting** | Diagnoses native host conflicts causing browser extension/Playwright failures; toggle mechanism, diagnostic commands, reset procedures | Any | Playwright MCP or browser automation tools show "not connected" errors |

### Not Used by BRIDGE (3 skills -- genuinely out of scope)

| Skill | What it does | Why not used |
|-------|-------------|-------------|
| **let-fate-decide** | Tarot spread for ambiguous prompts | Entertainment -- use `ask-questions-if-underspecified` instead |
| **culture-index** | Team personality survey interpretation | HR/organizational -- outside pipeline scope |
| **debug-buttercup** | Debug Buttercup CRS on Kubernetes | Trail of Bits internal tool |

## MCP Servers (installed)

| MCP Server | What it provides | When to use |
|------------|-----------------|-------------|
| **azure-pricing** | Real Azure service pricing and cost estimation | Phase 3 -- accurate Azure cost models for proposals |
| **aws-pricing** | Real AWS service pricing and cost estimation | Phase 3 -- accurate AWS cost models for proposals |
| **sequential-thinking** | Structured step-by-step reasoning | Phase 1 -- structured BRIDGE analysis |
| **uml** | Formal UML diagram generation (C4, BPMN, ERD, sequence) | Phase 3 -- formal architecture diagrams |
| **memory** | Persistent knowledge graph across sessions | All agents -- store/retrieve project facts and decisions |
| **gitguardian** | Secrets detection and credential scanning | Phase 5 -- scan for exposed secrets before delivery |
| **serena** | LSP code intelligence: find_symbol, find_referencing_symbols, replace_symbol_body, rename_symbol, get_symbols_overview | Phase 3, 4, 5 -- precise symbol navigation, cross-file refactoring (optional -- degrade gracefully if not installed) |
| **greptile** | AI semantic code search via MCP (requires GREPTILE_API_KEY) | Phase 3, 5 -- codebase understanding (optional) |
| **deepwiki** | AI-generated documentation from public GitHub repos (plugin: devin-ai-integration/mcp-server-deepwiki) | Phase 2, 3, 4 -- Tier 2 doc access for repos without llms.txt (optional) |
| **code-review-graph** | Codebase knowledge graph -- blast radius, call graph, semantic search | Phase 4, 5 -- query code structure (optional) |

## CLI Tools (installed)

| CLI Tool | What it provides | When to use | Reference |
|----------|-----------------|-------------|-----------|
| **crawl4ai** (`crwl`) | Web scraping to clean markdown (free, local, no auth) | Phase 2 -- primary doc access tool | `docs/reference/crawl4ai.md` |
| **semgrep** | SAST static analysis (OWASP Top 10) | Phase 4 (per-slice), Phase 5 (full scan) | `docs/reference/semgrep.md` |
| **vitest** | Fast JS/TS test runner with coverage | Phase 4 -- TDD test execution | `docs/reference/vitest.md` |
| **eslint** | JS/TS code quality linting and auto-fix | Phase 4 -- code standards enforcement | `docs/reference/eslint.md` |
| **lighthouse** | Performance, accessibility, SEO, best practices | Phase 5 -- frontend audit | `docs/reference/lighthouse.md` |
| **gh** | GitHub CLI for repos, PRs, issues, releases | All phases -- GitHub operations | `docs/reference/gh-cli.md` |
| **pandoc** | Document format conversion (Markdown to DOCX, PDF, HTML, LaTeX) | Phase 5 -- deliverable generation (Word docs) | -- |
| **pptxgenjs** | PowerPoint generation from pipeline data | Phase 5 -- deliverable generation (PPTX) | -- |
| **exceljs** | Excel spreadsheet generation | Phase 5 -- deliverable generation (XLSX) | -- |
| **remotion** | React-to-image renderer for branded visuals, hero slides, infographics, data viz stills | Phase 3 (diagram fallback), Phase 5 (MANDATORY for PPTX visuals) | `modules/remotion-renderer.md` |
| **stryker** | Mutation testing -- verifies tests catch real bugs | Phase 5 -- critical business logic (optional) | `docs/reference/stryker.md` |
| **pixelmatch** | Pixel-by-pixel screenshot comparison | Phase 4 -- visual regression (optional) | `docs/reference/pixelmatch.md` |
| **agent-reach** | Community research CLI -- 17 platform aggregator | Phase 2 -- community intelligence | `~/.claude/skills/agent-reach/SKILL.md` |
| **mcporter** | MCP server manager (hosts Exa AI search) | Phase 2 -- semantic web search | -- |
| **rdt-cli** | Reddit search and reading (no login needed) | Phase 2 -- community workarounds, gotchas | -- |
| **yt-dlp** | YouTube/video subtitle extraction and metadata | Phase 2 -- conference talks, tutorials | -- |
| **codex** | OpenAI Codex CLI -- cross-LLM code review and task delegation | Phase 5 -- cross-LLM adversarial review | -- |

## Tool Pricing, Tier Limits, and Fallback Chains

All external tools have usage limits. The orchestrator respects these and
degrades gracefully when limits are reached or tools are unavailable.

| Tool | Free Tier | Paid Tier | Fallback Chain |
|------|-----------|-----------|----------------|
| **Codex CLI** | ChatGPT Free works (limited capacity) | API key pay-as-you-go per token | Codex -> Gemini CLI -> Claude-only (skip Step 5.1f) |
| **Gemini CLI** | 60 req/min via Google AI Studio | N/A | Gemini -> Codex -> Claude-only |
| **Exa** (via mcporter) | 1,000 searches/mo | $5/1000 searches | Exa -> WebSearch -> crawl4ai -> training knowledge [UNVERIFIED] |
| **rdt-cli** | Unlimited (public Reddit API) | N/A | rdt-cli -> WebSearch site:reddit.com -> skip |
| **yt-dlp** | Unlimited (direct download) | N/A | yt-dlp -> WebSearch site:youtube.com -> skip |
| **gitguardian MCP** | Free (plugin auth) | Enterprise | gitguardian -> grep patterns -> semgrep secrets rules |
| **Greptile** | NONE ($30/dev/mo, no free tier) | $30/dev/mo | NOT RECOMMENDED -- use code-review-graph MCP, serena, or grep |
| **Trail of Bits skills** | All free, no limits | N/A | Always available if installed |
| **Codex Stop hook** | Same as Codex CLI | Same | Disabled by default (config.codex_review_gate = false) |
| **crawl4ai** | Free, local, no auth | N/A | crawl4ai -> Playwright -> Context Hub -> Context7 -> WebSearch |
| **semgrep** | Free OSS | Pro (cross-file) | Always available if installed |

**Fallback behavior:** When the primary tool in a chain fails or is unavailable,
the orchestrator tries the next tool silently. The final fallback is always
Claude-only analysis (no external tool). Fallback transitions are logged to
`pipeline/tooling-manifest.md` but not surfaced to the user unless they
explicitly requested a specific tool.

**[UNVERIFIED] tag:** When a fallback chain reaches "training knowledge," any
facts produced MUST be tagged [UNVERIFIED] in deliverables. This flag is
inherited through all downstream artifacts.

## Smart Plugin Check (Step 0.0c)

During initialization, compare installed plugins against the recommended list above. Only show gaps to the user. If all CRITICAL and HIGH priority plugins are present, just say `Plugins: all recommended [ok]` and move on.

**Auto-install is NOT possible for plugins** -- they require interactive `claude plugin marketplace add`. The orchestrator can only INFORM the user.

**CLI tools CAN be auto-installed** -- present a single install plan and execute in one Bash command.

**Trail of Bits marketplace install:**
```bash
# If not already added:
# claude plugin marketplace add trailofbits/skills
# Then install individual skills as needed
```
