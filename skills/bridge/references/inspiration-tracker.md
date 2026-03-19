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