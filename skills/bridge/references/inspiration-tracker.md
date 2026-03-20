# Inspiration Sources & Implementation Tracker

Features cherry-picked from external repos and their implementation status.

## Repo: daai-dev-workflow (original workflow, sessions 1-3)
- [x] Full pipeline (Phases 1-6) — fully absorbed, Bridge IS this evolved

## Repo: AutoResearchClaw (github.com/aiming-lab/AutoResearchClaw)
- [x] llms.txt quick-check before crawling docs
- [x] Tiered documentation access strategy (llms.txt -> crawl4ai -> Playwright -> Context7 -> WebSearch)
- [ ] ~~Academic paper search~~ — EXCLUDED (out of scope)

## Repo: everything-claude-code (github.com/affaan-m/everything-claude-code)
- [x] Model Routing (cost-aware agent selection)
- [x] BRIDGE_SLICE_COMPLETE signal protocol
- [x] Stall detection / Loop Monitor
- [x] Cross-run lesson capture (pipeline/lessons/*.md)
- [x] De-Sloppify cleanup pass
- [ ] ~~Loop Operator as separate agent~~ — EXCLUDED (orchestrator IS the monitor)

## Repo: get-shit-done / GSD (github.com/gsd-build/get-shit-done)
- [x] Fresh context per agent (context-by-reference)
- [x] Configuration system (pipeline/config.json)
- [x] Goal-Backward Verification + stub detection
- [x] Plan-Checker (pre-build validation, 7 dimensions, 3 loops)
- [x] Deviation Rules for specialists
- [x] Analysis Paralysis Guard
- [x] Discuss Phase (optional Step 0.5)
- [ ] Nyquist Validation — CONFIG FLAG EXISTS but logic NOT implemented
- [ ] Wave-based parallelism — NOT YET
- [ ] Checkpoint Protocol (3 types) — NOT YET
- [ ] Session pause/resume — NOT YET
- [ ] ~~Multi-runtime support~~ — EXCLUDED
- [ ] ~~CLI tool (gsd-tools.cjs)~~ — EXCLUDED

## Repo: agency-agents / The Agency (github.com/msitarzewski/agency-agents)
- [x] Reality Checker QA pattern (Validator defaults to REJECT)
- [x] Structured handoff templates
- [x] Dev-QA loop with 3-attempt max per slice
- [x] Project type presets / runbooks
- [ ] Agent personality traits — NOT YET
- [ ] ~~144-agent prompt library~~ — EXCLUDED
- [ ] ~~NEXUS orchestration doctrine~~ — EXCLUDED

## Vertical Slicing Research (session 5)
- [x] Walking Skeleton as Slice 1
- [x] INVEST criteria for slice validation
- [x] Vertical slice decomposition
- [x] Per-slice human approval gates

## Superpowers integration & Critical Evaluator (session 7)
- [x] Orchestrator as "methodology gateway"
- [x] Mandatory Skill invocations table
- [x] Cache pattern for repeated skill invocations
- [x] Ojo Critico (Critical Eye) at every phase gate
- [x] Phase-specific critical review focus
- [x] Anti-inline rule
- [x] Phase 6 deliverable generation via subagent spawns
- [x] Agent Experience Accumulation (Step 4.7)
- [ ] ~~Pre-built agent library~~ — EXCLUDED

## Context Window Optimization (session 8)
- [x] Phase Gate Enforcement — mandatory file-existence checkpoints at every gate
- [x] Anti-skip reinforcement in Ojo Critico header
- [x] Conservative reference extraction (only non-operational content)
- [x] Anchor summaries for Ojo Critico

## From MiroFish analysis (session 4)
- [ ] Persistent knowledge graph across projects — DEFERRED
- [ ] ReACT pattern for deliverable generation — DEFERRED
- [ ] Granular progress callbacks — DEFERRED

## Repo: claude-code-best-practice (github.com/shanraisshan/claude-code-best-practice) — Evaluated 2026-03-20
**Verdict: NOT WORTH INSTALLING. Bridge already covers 95%+ of documented patterns.**
Documentation/config reference repo, not an executable framework. Analysis:
- [x] Subagents pattern — Bridge has dynamic agent composition (SUPERIOR)
- [x] Commands pattern — Bridge has `.claude/commands/bridge.md`
- [x] Skills pattern — Bridge has 13+ skills
- [x] MCP Servers (Playwright, Context7) — Bridge has these + 6 additional MCPs
- [x] Memory system — Bridge has `memory: project` on all agents + memory MCP
- [x] Workflow orchestration (Command→Agent→Skill) — Bridge has 6-phase pipeline with reconciliation (SUPERIOR)
- [x] Model routing — Bridge has cost-aware model routing per phase
- [x] Permission model — Bridge has tool denial handling + fallback chains
- [x] Research→Plan→Execute→Review→Ship — Bridge has Translate→Research→Architect→Build→Validate (SUPERIOR)
- [x] Context management — Bridge has fresh context per agent, context-by-reference
- [ ] DeepWiki MCP — Could complement crawl4ai/Context7 in fallback chain. TRIVIAL to add.
- [ ] ~~Checkpointing~~ — EXCLUDED (Bridge has TDD commits; git-based checkpointing is redundant)
- [ ] ~~Channels (beta)~~ — EXCLUDED (Claude Code beta feature, not a Bridge concern)
- [ ] ~~Agent Teams (beta)~~ — EXCLUDED (Claude Code feature; Bridge has its own parallel execution)
- [ ] ~~Custom spinner/tips/UI~~ — EXCLUDED (cosmetic, not functional)
- [ ] ~~CLAUDE.md < 200 lines tip~~ — N/A (Bridge uses SKILL.md, not CLAUDE.md for main logic)
- [ ] ~~Hierarchical settings~~ — N/A (Bridge is a skill, not a settings framework)

## Self-Evaluation: Architecture Review (session 10, 2026-03-20)
Key findings from deep analysis using skill-creator + superpowers:
- [ ] Consolidate SKILL.md/bridge.md — SKILL.md is 2,468 lines, bridge.md is 776 lines, already diverging
- [ ] Progressive disclosure refactor — Split SKILL.md into core (~400 lines) + phases/*.md on-demand
- [ ] Split Validator into 3 agents — Validator, CodeReviewer, SecurityAuditor
- [ ] Make security gates mandatory/blocking — semgrep + gitguardian must BLOCK delivery on CRITICAL
- [ ] Eliminate 4 redundant skills — requirements-translator, research-scout, solution-architect, code-validator are empty wrappers
- [ ] Move 6 CLI tool skills to docs/reference/ — crawl4ai, gh-cli, eslint, vitest, lighthouse, semgrep
- [ ] Add context window budgeting — Define token limits per phase, conservative reference extraction
- [ ] Add error logging — pipeline/error-log.md audit trail
- [ ] Implement per-specialist checkpointing — Resume Phase 4 after crashes
- [ ] Add token/cost tracking — Users need visibility into spend per phase
- See full report: clients/internal/bridge-skill-evaluation/pipeline/01-evaluation-report.md