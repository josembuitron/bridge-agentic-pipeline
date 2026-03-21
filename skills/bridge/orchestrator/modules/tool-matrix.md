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
| **solution-architect** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, Playwright, Excalidraw, azure-pricing, aws-pricing, uml, memory | crawl4ai | BRIDGE G+E, architecture exploration |
| **validator** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | Context7, memory | -- | Goal-backward verification, requirements traceability |
| **code-reviewer** | Read, Write, Glob, Grep, Bash | -- | memory | eslint | Clean code, test quality |
| **security-auditor** | Read, Write, Glob, Grep, Bash | WebSearch, WebFetch | gitguardian, memory | semgrep | OWASP Top 10, SAST, secrets detection |
| **spec-* (code)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Serena, code-review-graph, memory | vitest, eslint | TDD, Serena for precise edits |
| **spec-* (integration)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Context7, Playwright, Serena, memory | vitest, eslint, crawl4ai | TDD + doc access |
| **spec-* (frontend)** | Read, Write, Edit, Bash, Glob, Grep | WebSearch, WebFetch | Playwright (all 5), Serena, memory | vitest, eslint, lighthouse | Design-first, visual verification |
| **de-sloppify** | Read, Write, Edit, Glob, Grep, Bash | -- | -- | eslint | Dead code removal, naming, YAGNI |

## Model Routing

Read `modules/model-routing.md` for cost-aware model selection per agent type.
