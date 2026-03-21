# Pixel Agent VS Code Description Convention

The Pixel Agent VS Code extension monitors Claude Code's JSONL transcripts and visualizes sub-agents as animated characters. The `description` parameter of each Agent tool call is displayed as the agent's status.

## Description Format
```
[Phase {N}] {Agent Display Name} — {Current Task Summary}
```

## Core Agent Descriptions (use EXACTLY)

| Phase | Agent | Description |
|-------|-------|-------------|
| 0b | codebase-analyzer | `[Phase 0b] Codebase Analyzer — Scanning existing codebase structure` |
| 1 | requirements-translator | `[Phase 1] Requirements Translator — Analyzing business context with BRIDGE framework` |
| 1 (retry) | requirements-translator | `[Phase 1] Requirements Translator — Revising analysis with feedback` |
| 2 | researcher | `[Phase 2] Technology Researcher — Investigating APIs, tools, and integrations` |
| 2 (retry) | researcher | `[Phase 2] Technology Researcher — Deepening research on {specific area}` |
| 3 | solution-architect | `[Phase 3] Solution Architect — Designing architecture and agent team` |
| 3 (retry) | solution-architect | `[Phase 3] Solution Architect — Revising architecture with feedback` |
| 3b | plan-checker | `[Phase 3b] Plan Checker — Verifying build plan will achieve goals` |
| 5 | validator | `[Phase 5] Validator — Validating requirements coverage and architecture compliance` |
| 5 | code-reviewer | `[Phase 5] Code Reviewer — Reviewing code quality and test coverage` |
| 5 | security-auditor | `[Phase 5] Security Auditor — Running mandatory security scans` |
| 5 (retry) | validator | `[Phase 5] Validator — Re-validating after fixes` |

## Dynamic Specialist Descriptions (Phase 4)
```
[Phase 4] {Specialist Display Name} — Slice {N}: {specific task}
```
Examples:
- `[Phase 4] NetSuite Integrator — Slice 1: Walking skeleton - fetch one record type`
- `[Phase 4] Power BI Developer — Slice 2: Creating sales measures with DAX`
- `[Phase 4] Data Quality Engineer — Slice 3: Implementing validation rules`

## Re-run / Fix Descriptions
```
[Phase 4] {Name} — Fixing Slice {N}: {issue summary from validator}
```

## Other Descriptions
- Ojo Critico: `[Phase {N}] Critical Review — Challenging {phase name} output`
- De-Sloppify: `[Phase 4] Code Cleanup — Removing dead code and improving clarity`
- Deliverables: `[Phase 6] Report Generator — Creating client-facing technical report`

## Rules
- ALWAYS include phase number in brackets
- ALWAYS use human-readable display name (not file slug)
- Keep task summary under 60 characters
- Update summary on retries to reflect new context
