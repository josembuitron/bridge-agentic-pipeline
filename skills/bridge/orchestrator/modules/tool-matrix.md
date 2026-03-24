# Agent-to-Tool Assignment Matrix

## Tool Assignment by Role Type

**IMPORTANT**: Sub-agents CANNOT use the `Skill` tool. Include methodology instructions directly in each agent's prompt, and add actual MCP tools to their `tools:` frontmatter.

### For ALL Code-Writing Specialists
Tools: `Read, Write, Edit, Bash, Glob, Grep`
Methodology:
- **TDD**: Write failing test → implement → pass → commit
- **Frequent commits**: Commit after each working unit
- **Security awareness**: Check for injection, hardcoded credentials, exposed secrets

### For Specialists Needing Documentation Access
Add to tools (based on AVAILABLE_DOC_TOOLS):
- `Bash` — for crawl4ai CLI and Context Hub
- `WebSearch, WebFetch` — fallback
- `mcp__plugin_context7_context7__*` — if working with code libraries
- `mcp__plugin_playwright_playwright__*` — if dealing with interactive doc sites

### For Validation/Review Agents
Tools: `Read, Write, Glob, Grep, Bash, WebSearch, WebFetch`
Methodology:
- **Systematic Debugging**: Diagnose root cause before proposing fixes
- **Test-Driven Verification**: Run ALL test suites via Bash
- Verify requirements traceability
- Verify BRIDGE alignment
- Check for YAGNI violations
- Verify security at system boundaries

### For Frontend/UI Specialists
Tools: `Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch`
Add Playwright if available: `browser_navigate, browser_snapshot, browser_take_screenshot`
Methodology: Design-first, visual verification with Playwright

## Complete Agent-to-Tool Matrix

| Agent | Base Tools | Doc Tools | MCP Tools | CLI Tools | Methodology |
|-------|-----------|-----------|-----------|-----------|-------------|
| **requirements-translator** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, sequential-thinking, memory | -- | BRIDGE B-R-I-D, domain research |
| **researcher** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, Playwright (5 tools), memory | crawl4ai | Tiered doc access |
| **solution-architect** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, Playwright (navigate, snapshot), Greptile (if avail), Excalidraw (if avail), Serena (if avail), azure-pricing, aws-pricing, uml, memory | crawl4ai, diagrams (Python), d2, remotion (fallback #3 for diagrams) | BRIDGE G+E, architecture exploration, SVG diagram generation with cloud icons, Remotion for branded visuals, Serena for existing codebase symbol analysis |
| **effort-estimator** | Read, Glob, Grep, Bash | -- | -- | -- | 3-scenario estimation (Human-Only, Bridge-Only, Hybrid) from solution proposal |
| **validator** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, Greptile (if avail), gitguardian, Serena (if avail), code-review-graph (if avail), memory | semgrep, lighthouse | BRIDGE alignment, SAST, secrets, Serena for wired-vs-orphaned check |
| **code-reviewer** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | memory | eslint | Clean code, test quality |
| **security-auditor** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | gitguardian, memory | semgrep | OWASP Top 10, SAST, secrets detection |
| **spec-* (code)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Serena, code-review-graph, memory | vitest, eslint | TDD, Serena for precise edits |
| **spec-* (python)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Serena, code-review-graph, memory | uv, ruff, ty, pytest | TDD, modern-python toolchain |
| **spec-* (integration)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Playwright, Serena, memory | vitest, eslint, crawl4ai | TDD + doc access |
| **spec-* (frontend)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Playwright (all 5), Serena, memory | vitest, eslint, lighthouse | Design-first, visual verification |
| **spec-* (blockchain)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Serena, memory | hardhat/foundry/anchor | TDD + building-secure-contracts |
| **spec-* (infra)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, memory | terraform/kubectl/docker/az/aws | IaC, devcontainer-setup |
| **de-sloppify** | Read, Write, Edit, Glob, Grep, Bash | -- | -- | eslint | Dead code removal, naming, YAGNI |
| **presentation-generator** | Read, Write, Edit, Bash, Glob, Grep | -- | -- | pptxgenjs, **remotion** (MANDATORY for hero slides/branded visuals), exceljs | Read `modules/remotion-renderer.md`. Render Remotion compositions FIRST, then generate PPTX with images + editable text |
| **report-generator** | Read, Write, Edit, Bash, Glob, Grep | -- | -- | pandoc, **remotion** (MANDATORY for executive infographic) | Read `modules/remotion-renderer.md`. Generate HTML with embedded Remotion PNGs |

## Dynamic Dependency Resolution

Specialists may need tools beyond the base matrix. The Architect specifies these in the `dependencies` field of each specialist definition. The orchestrator resolves them at Step 4.1:

| Dependency Type | Resolution | Blocking? |
|---|---|---|
| CLI tools | Auto-install via setup script in `scripts/setup-{role}.sh` | Yes — install before spawning |
| npm packages | `npm install {package}` (project-local) | Yes — install before spawning |
| pip packages | `pip install {package}` (or `uv pip install`) | Yes — install before spawning |
| MCP servers | If available: add to agent's `tools:` frontmatter. If NOT installed: inform user at approval gate, embed equivalent methodology in agent prompt, note degraded capability | No — degrade gracefully |
| Trail of Bits skills | If installed: invoke and embed output. If NOT installed: embed from `docs/reference/` or crawled reference docs | No — degrade gracefully |
| Helper scripts | Orchestrator creates scripts from `scripts_needed` in `{project}/scripts/` BEFORE spawn. Agents may create additional scripts during execution for needs discovered at build time | Yes — pre-spawn scripts created before spawning |

## Agent Script Creation Authority

ALL specialist agents are authorized to create scripts in `{project-path}/scripts/`:
- Setup/install scripts
- Mock servers and test fixtures
- Data migration/seed scripts
- Build/deploy automation
- API testing scripts

Scripts MUST have: shebang line, `set -euo pipefail` (bash), clear naming, and be logged in build manifest.

## Tooling Manifest (MANDATORY)

At every phase transition, the orchestrator MUST update `pipeline/tooling-manifest.md` with the actual tools, agents, and skills used. Read `modules/tooling-manifest.md` for the full template and protocol.

## Model Routing

Read `modules/model-routing.md` for cost-aware model selection per agent type.
