# Cross-Skill Activation

The orchestrator SHOULD invoke installed skills at strategic points. Use the `Skill` tool when available.

**IMPORTANT**: Only the orchestrator can invoke skills. Sub-agents CANNOT use the `Skill` tool.

## Mandatory Skill Invocations by Phase

| When | Orchestrator invokes | Then embeds in... |
|------|---------------------|-------------------|
| Before Phase 1 | `ask-questions-if-underspecified` (ToB) | Translator prompt -- force clarification of ambiguous requirements |
| Phase 2 research | `references/tool-risk-matrix.md` (reference) | Researcher prompt -- taint tracking + tool risk classification |
| Phase 2 research | `agent-reach` (community research) | Researcher prompt -- Reddit, Exa, YouTube for real-world technology validation |
| Before Phase 3 | `superpowers:brainstorming` | Architect prompt -- 2-3 approaches with trade-offs |
| Before Phase 3 | `superpowers:writing-plans` | Architect prompt -- structure specialist breakdown |
| Before Phase 3 | `entry-point-analyzer` (ToB) | Architect prompt -- attack surface mapping |
| Before Phase 3 | `insecure-defaults` (ToB) | Architect prompt -- flag insecure defaults |
| Before Phase 3 | `audit-context-building` (ToB) | Architect prompt -- deep architectural context (modules, entrypoints, actors, storage) |
| Before Phase 3 (brownfield) | `spec-to-code-compliance` (ToB) | Architect prompt -- verify existing code against new spec |
| Before Phase 4 (once) | `superpowers:test-driven-development` | ALL code-writing specialist prompts |
| Before Phase 4 (once) | `sharp-edges` (ToB) | ALL specialist prompts -- dangerous API patterns |
| Phase 4 if critical logic | `property-based-testing` (ToB) | Specialist prompts for financial/security/data slices |
| Phase 4 if critical logic | `testing-handbook-skills` (ToB) | Specialist prompts -- fuzzing, sanitizers, harness-writing |
| Phase 4 if frontend | `frontend-design:frontend-design` | Frontend specialist prompts |
| Phase 4 if blockchain | `building-secure-contracts` (ToB) | Smart contract specialist prompts -- 20+ vulnerability patterns |
| After Phase 5 Validator | `superpowers:verification-before-completion` | Orchestrator verifies claims vs evidence |
| Phase 5 security | `static-analysis` (ToB) | Deep SAST (CodeQL + Semgrep + SARIF) |
| Phase 5 security | `supply-chain-risk-auditor` (ToB) | Audit dependencies for CVEs, typosquatting |
| Phase 5 security | `differential-review` (ToB) | Compare final code vs architecture plan |
| Phase 5 security | `spec-to-code-compliance` (ToB) | Evidence-based alignment: spec vs implementation |
| Phase 5 security | `audit-context-building` (ToB) | Ultra-granular analysis of final codebase |
| Phase 5 deliverables | `modules/remotion-renderer.md` (module) | **MANDATORY** -- Render Remotion branded visuals (hero slides, infographics, data viz) BEFORE PPTX generation |
| Phase 5 deliverables | `modules/tooling-manifest.md` (module) | **MANDATORY** -- Update tooling manifest with all tools used per phase |
| Phase 5 security | `fp-check` (ToB) | Systematic false positive verification for all SAST findings |
| Phase 5 if vuln found | `variant-analysis` (ToB) | Search for same pattern everywhere |
| Phase 5 if vuln found | `semgrep-rule-creator` (ToB) | Create custom Semgrep rule for project-specific pattern |
| Phase 5 if multi-lang + custom rule | `semgrep-rule-variant-creator` (ToB) | Port custom rule to each project language |
| Phase 5 if GitHub Actions CI/CD | `agentic-actions-auditor` (ToB) | Audit AI agent workflow vulnerabilities |
| Phase 5 if crypto/secrets in memory | `zeroize-audit` (ToB) | Detect missing zeroization of sensitive data |
| Phase 5 if timing-sensitive crypto | `constant-time-analysis` (ToB) | Detect compiler-induced timing side-channels |
| Phase 5 if blockchain | `building-secure-contracts` (ToB) | Platform-specific vulnerability detection |
| Phase 5 if Android+Firebase | `firebase-apk-scanner` (ToB) | Scan for Firebase misconfigurations |
| Phase 5 if external LLMs available | `second-opinion` (ToB) | Independent code review with different model |
| Phase 5 start (parallel) | `codex:adversarial-review` (codex plugin) | Background job -- collected at Step 5.1f |
| Phase 5 Step 5.1f | `modules/consolidated-review.md` (module) | Cross-LLM review consolidation |
| Phase 5 if Burp report exists | `burpsuite-project-parser` (ToB) | Parse pentest findings into validation pipeline |
| Phase 5 if compiled binaries | `dwarf-expert` (ToB) | Verify binary integrity, detect debug info tampering |
| Phase 4 if Python project | `modern-python` (ToB) | Enforce uv/ruff/ty/pytest ecosystem (embed in Python specialist prompts) |
| Phase 4 after each slice | `modules/structural-linter.md` (module) | Orchestrator runs structural checks + error enrichment |
| Phase 4 Step 4.5 | `modules/garbage-collector.md` (module) | De-Sloppify agent runs 5 GC checks for entropy detection |
| Phase 3 architect | `modules/harness-hooks.md` (module) | Architect generates Section I: Project Quality Hooks |
| Phase 4 Slice 1 | `modules/harness-hooks.md` (module) | Walking Skeleton installs pre-commit hooks |
| Phase 4 if client wants devcontainer | `devcontainer-setup` (ToB) | Generate `.devcontainer/` config as deliverable |
| Phase 4 after new agent created | `skill-improver` (ToB) | Refine specialist agent quality before spawning |
| Phase 2, 4 when external scripts/tools installed | `yara-authoring` (ToB) | Scan downloaded scripts/packages/skills for malicious patterns |
| Phase 2, 4 when adding npm/pip packages | `supply-chain-risk-auditor` (ToB) | Audit new dependencies BEFORE adding (shift-left) |
| All phases accessing GitHub | `gh-cli` (ToB) | Enforce authenticated gh CLI (5000/hr vs 60/hr rate limit) |
| Post Phase 5 | `git-cleanup` (ToB) | Clean accumulated specialist/feature branches |
| Pipeline self-improvement | `workflow-skill-design` (ToB) | Audit and improve pipeline skill structure |
| After Phase 5 | `superpowers:finishing-a-development-branch` | Integration checklist |
| On any error | `superpowers:systematic-debugging` | Re-spawn agent with debugging methodology |
| On Playwright/browser failure | `claude-in-chrome-troubleshooting` (ToB) | Diagnose native host conflicts, toggle mechanism, reset |

## How to Activate Superpowers for Subagents

1. BEFORE spawning a phase agent, invoke the relevant Skill
2. The Skill loads methodology into orchestrator's context
3. Extract key instructions
4. Embed into subagent's prompt
5. Subagent follows methodology as if it invoked the skill itself

**Cache pattern:** Invoke once, extract text, reuse across all specialists in session.

## Phase-Specific Tool Activations

| Phase | Skill/Tool | When |
|-------|-----------|------|
| Phase 1 | sequential-thinking MCP | Structured BRIDGE B-R-I-D reasoning |
| Phase 1 | memory MCP | Store business context, stakeholder names |
| Phase 2 | crawl4ai CLI (Bash) | Research online documentation |
| Phase 2 | agent-reach: Exa (mcporter), rdt-cli, yt-dlp | Community intelligence -- workarounds, gotchas, real-world validation |
| Phase 2 | memory MCP | Store research findings, API capabilities |
| Phase 3 | diagrams (Python) / D2 / **Remotion** (fallback #3) / Excalidraw MCP | Generate SVG/PNG architecture diagrams with cloud icons (see `modules/architecture-diagrams.md`) |
| Phase 3 | @panzoom/panzoom (CDN) | Interactive zoom/pan on SVG diagrams in HTML deliverable |
| Phase 3 | effort-estimator agent | 3-scenario effort estimation (Human-Only, Bridge-Only, Hybrid) |
| Phase 3 | azure-pricing / aws-pricing MCP | Cost estimation for proposals |
| Phase 3 | uml MCP | Formal C4, BPMN, ERD diagrams |
| Phase 3 | memory MCP | Store architecture decisions |
| Phase 4 | vitest CLI (Bash) | TDD test execution |
| Phase 4 | eslint CLI (Bash) | Code quality linting |
| Phase 4 | semgrep CLI (Bash) | Per-slice security scan (SHIFT LEFT) |
| Phase 5 | `pr-review-toolkit:review-pr` | 6-pass deep review |
| Phase 5 | `code-review:code-review` | GitHub PR comments (if PR exists) |
| Phase 5 | semgrep CLI (Bash) | Full SAST scan |
| Phase 5 | gitguardian MCP | Secrets detection |
| Phase 5 | lighthouse CLI (Bash) | Frontend performance audit |
| Phase 5 | **remotion** (npm) | MANDATORY -- Render hero slides, infographics, data viz stills for PPTX |
| Phase 5 | `modules/tooling-manifest.md` | MANDATORY -- Finalize tooling manifest with all tools/agents/skills used |
| Phase 5 | `codex:adversarial-review` (plugin) | CODEX_PLUGIN available -- launched at Phase 5 start in background |
| Phase 5 | `second-opinion` (ToB) | External LLM CLI available -- fallback for cross-LLM review |
| Phase 5 | `modules/consolidated-review.md` | After 5.1d -- consolidate cross-LLM findings before quality score |
| Any | memory MCP | Persist cross-phase decisions |
| Any (phase transition) | `modules/tooling-manifest.md` | MANDATORY -- Update tooling manifest at every phase boundary |

**Do NOT skip mandatory invocations.** This table is executable workflow, not documentation.

## Conditional Skill Activation Guide

The orchestrator detects project characteristics during Phase 0 (initialization) and Phase 3 (architecture) to determine which conditional skills to activate:

| Project Characteristic | How to Detect | Skills to Activate |
|---|---|---|
| Blockchain/Web3 | Keywords: "smart contract", "Solidity", "EVM", "token", "DeFi" | `building-secure-contracts` |
| Cryptographic code | Keywords: "encryption", "AES", "RSA", "HMAC", "key derivation" | `constant-time-analysis`, `zeroize-audit` |
| Android + Firebase | Keywords: "Firebase", "APK", "Android", "Firestore" | `firebase-apk-scanner` |
| GitHub Actions CI/CD | `.github/workflows/` exists with AI agent steps | `agentic-actions-auditor` |
| Multi-language project | Multiple language extensions in `src/` | `semgrep-rule-variant-creator` |
| macOS/iOS with sandboxing | Keywords: "Seatbelt", "sandbox", "macOS app", "App Store" | `seatbelt-sandboxer` |
| External LLM CLIs installed | `which codex` or `which gemini` succeeds, OR skill list contains "codex:*" | `second-opinion`, `codex:adversarial-review`, `modules/consolidated-review.md` |
| Python project | `*.py` files in src/ or `pyproject.toml`/`setup.py` exists | `modern-python` |
| External scripts downloaded | Pipeline installs CLIs, downloads scripts, adds skills | `yara-authoring` (scan for malicious patterns) |
| Compiled binaries produced | Build output includes `.so`, `.dll`, `.exe`, `.wasm` | `dwarf-expert` (verify binary integrity) |
| Pentest report available | `.burp` files in input/ or keywords: "pentest", "Burp Suite" | `burpsuite-project-parser` |
| Client wants reproducible env | Keywords: "devcontainer", "Docker", "reproducible", "onboarding" | `devcontainer-setup` |
| New specialist agent created | Step 4.1 creates a new `spec-*.md` file | `skill-improver` (refine before spawning) |
| Pipeline quality review | User invokes `/bridge` with intent to improve the pipeline itself | `workflow-skill-design` |
