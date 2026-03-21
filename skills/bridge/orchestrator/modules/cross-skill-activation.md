# Cross-Skill Activation

The orchestrator SHOULD invoke installed skills at strategic points. Use the `Skill` tool when available.

**IMPORTANT**: Only the orchestrator can invoke skills. Sub-agents CANNOT use the `Skill` tool.

## Mandatory Skill Invocations by Phase

| When | Orchestrator invokes | Then embeds in... |
|------|---------------------|-------------------|
| Before Phase 3 | `superpowers:brainstorming` | Architect prompt — 2-3 approaches with trade-offs |
| Before Phase 3 | `superpowers:writing-plans` | Architect prompt — structure specialist breakdown |
| Before Phase 3 | `entry-point-analyzer` (ToB) | Architect prompt — attack surface mapping |
| Before Phase 3 | `insecure-defaults` (ToB) | Architect prompt — flag insecure defaults |
| Before Phase 4 (once) | `superpowers:test-driven-development` | ALL code-writing specialist prompts |
| Before Phase 4 (once) | `sharp-edges` (ToB) | ALL specialist prompts — dangerous API patterns |
| Phase 4 if critical logic | `property-based-testing` (ToB) | Specialist prompts for financial/security/data slices |
| After Phase 5 Validator | `superpowers:verification-before-completion` | Orchestrator verifies claims vs evidence |
| Phase 5 security | `static-analysis` (ToB) | Deep SAST on final codebase |
| Phase 5 security | `supply-chain-risk-auditor` (ToB) | Audit dependencies for CVEs, typosquatting |
| Phase 5 security | `differential-review` (ToB) | Compare final code vs architecture plan |
| Phase 5 if vuln found | `variant-analysis` (ToB) | Search for same pattern everywhere |
| After Phase 5 | `superpowers:finishing-a-development-branch` | Integration checklist |
| On any error | `superpowers:systematic-debugging` | Re-spawn agent with debugging methodology |
| Phase 4 if frontend | `frontend-design:frontend-design` | Frontend specialist prompts |

## How to Activate Superpowers for Subagents

1. BEFORE spawning a phase agent, invoke the relevant Skill
2. The Skill loads methodology into orchestrator's context
3. Extract key instructions
4. Embed into subagent's prompt
5. Subagent follows methodology as if it invoked the skill itself

**Cache pattern:** Invoke once, extract text, reuse across all specialists in session.

## Phase-Specific Skill Activations

| Phase | Skill/Tool | When |
|-------|-----------|------|
| Phase 1 | sequential-thinking MCP | Structured BRIDGE B-R-I-D reasoning |
| Phase 1 | memory MCP | Store business context, stakeholder names |
| Phase 2 | crawl4ai CLI (Bash) | Research online documentation |
| Phase 2 | memory MCP | Store research findings, API capabilities |
| Phase 3 | Excalidraw MCP (if available) | Convert Mermaid to PNG/SVG |
| Phase 3 | azure-pricing / aws-pricing MCP | Cost estimation for proposals |
| Phase 3 | uml MCP | Formal C4, BPMN, ERD diagrams |
| Phase 3 | memory MCP | Store architecture decisions |
| Phase 4 | vitest CLI (Bash) | TDD test execution |
| Phase 4 | eslint CLI (Bash) | Code quality linting |
| Phase 4 | semgrep CLI (Bash) | Per-slice security scan |
| Phase 5 | `pr-review-toolkit:review-pr` | 6-pass deep review |
| Phase 5 | `code-review:code-review` | GitHub PR comments (if PR exists) |
| Phase 5 | semgrep CLI (Bash) | Full SAST scan |
| Phase 5 | gitguardian MCP | Secrets detection |
| Phase 5 | lighthouse CLI (Bash) | Frontend performance audit |
| Any | memory MCP | Persist cross-phase decisions |

**Do NOT skip mandatory invocations.** This table is executable workflow, not documentation.
