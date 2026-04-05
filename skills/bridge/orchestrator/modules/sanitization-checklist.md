# Client Deliverable Sanitization Checklist

Before writing ANY client deliverable, verify it contains NONE of these:

## Forbidden Terms
- [ ] "agent" or "sub-agent" or "orchestrator" → use "team", "specialist", "engineer"
- [ ] "skill" or "SKILL.md" → use "methodology", "approach", "process"
- [ ] "MCP server" or "MCP" → use "integration connector", "API integration"
- [ ] "Claude" or "Claude Code" or "Anthropic" → use "our team", "our process"
- [ ] "pipeline" (in agent pipeline context) → use "project phases", "workflow"
- [ ] "memory: project" or "MEMORY.md" → use "institutional knowledge", "best practices"
- [ ] "spawn" or "spawning" → use "assign", "engage", "deploy"
- [ ] Any agent file names like "spec-*.md" or ".claude/agents/*.md"
- [ ] "BRIDGE framework" or "B-R-I-D-G-E" → use "our analysis methodology"
- [ ] "Ojo Critico" or "Critical Eye" → use "quality review", "peer review"
- [ ] "knowledge graph" → use "institutional knowledge", "client history"

## Replacement Patterns
| Internal Term | Client-Facing Term |
|---|---|
| spec-netsuite-integrator agent | Data Integration Specialists |
| spec-power-bi-developer agent | BI Development Team |
| spec-azure-deploy agent | Infrastructure Engineers |
| validator agent | QA process |
| orchestrator | project management |
| Phase 4 build | Implementation phase |
| BRIDGE_SLICE_COMPLETE | milestone completion |

## Harness Engineering Terms (internal → client)
| Internal Term | Client-Facing Term |
|---|---|
| taint tracking | data flow validation |
| taint source | external data source |
| tool risk matrix | tool capability assessment |
| harness engineering | engineering best practices |
| garbage collection agent | code quality review process |
| sanitization guard | input validation layer |
| [EXTERNAL-UNVERIFIED] | In internal pipeline/ files: KEEP the tag for validators. In client deliverables/: replace with "Based on vendor documentation and community sources as of {date}" -- NEVER present as independently validated |
| structural linter | code quality verification |
| error enrichment | automated code guidance |
| import direction violation | dependency structure review |
| ARCH VIOLATION | architecture review finding |
| pre-commit hook | automated quality check |
| harness hooks | project quality automation |
| BRIDGE_HOOK_MODE | quality mode setting |
| pipeline guard | automated safety check |

## Tone
- Present work as human team effort
- "Our data engineering team" (not "our agents")
- "Our integration specialists" (not "spec-netsuite-integrator agent")
- "Our architecture team designed..." (not "the solution-architect agent produced...")
- "Our QA process validated..." (not "the validator agent checked...")
- Professional consulting language throughout
