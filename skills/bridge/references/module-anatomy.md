# Module Anatomy Reference

This document defines the standard structure, conventions, and patterns for BRIDGE pipeline modules. Follow this when creating new modules or reviewing existing ones.

## Module Types

BRIDGE has four categories of files, each with distinct purposes:

| Category | Location | Purpose | Loaded When |
|---|---|---|---|
| **Phase files** | `orchestrator/phases/` | Sequential pipeline steps with agent dispatch | On phase start (orchestrator reads) |
| **Module files** | `orchestrator/modules/` | Reusable logic referenced by phases | On-demand when a phase references them |
| **Reference files** | `references/` | Static policies, schemas, checklists | On-demand when a module or phase references them |
| **Templates** | `templates/` | Output format definitions for agents | Passed to agents as context-by-reference |

## Standard Module Structure

Every module in `orchestrator/modules/` SHOULD follow this structure:

```markdown
# {Module Name}

{1-2 sentence description of what this module does and when it is used.}

## When to Use

{Conditions that trigger this module's use. Which phases reference it. What config flags enable/disable it.}

## {Main Content Sections}

{The actual logic, rules, templates, or instructions. Organized by workflow step or concern.}

## Integration Points

{How this module connects to other modules, phases, or external tools. File paths it reads from or writes to.}
```

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Phase files | `NN-verb.md` (2-digit phase number) | `01-translate.md`, `04-build.md` |
| Module files | `kebab-case-noun.md` (descriptive) | `context-budget.md`, `cost-tracking.md` |
| Reference files | `kebab-case.md` or `.json` | `tool-risk-matrix.md`, `config-schema.json` |
| Templates | `kebab-case.md` (match output name) | `technical-definition.md`, `solution-proposal.md` |
| Pipeline artifacts | `NN-descriptor.md` or `.json` | `01-technical-definition.md`, `03d-effort-estimation.md` |

## Size Guidelines

| File Type | Target | Hard Limit | Action If Exceeded |
|---|---|---|---|
| Phase files | 200-400 lines | 600 lines | Extract reusable logic into a module |
| Module files | 50-200 lines | 300 lines | Split into focused sub-modules |
| Reference files | 20-100 lines | No limit (static data) | Keep JSON compact |
| Templates | 30-80 lines | 150 lines | Templates are output format, not logic |

## Loading Pattern

BRIDGE uses **on-demand loading** to manage context budget:

```
Phase start
  -> Orchestrator reads core.md (always)
  -> Orchestrator reads phase file (NN-phase.md)
  -> Phase file says "Read modules/X.md"
  -> Orchestrator reads module X only when needed
  -> Module X may reference "See references/Y.md"
  -> Agent reads reference Y only if its task requires it
```

**Rules:**
- NEVER preload all modules at session start
- core.md Quick Reference (lines 1-27) is the only thing safe to re-read mid-phase
- Modules are read by the orchestrator, NOT passed inline to agents
- Agents receive file paths (context-by-reference), not module content

## Context-by-Reference Pattern

When a phase or module needs an agent to use information:

**Correct:**
```markdown
## Context Files (read these first)
- Research Report: {project-path}/pipeline/02-research-report.md
- Locked constraints: {project-path}/pipeline/00-constraints.md
```

**Incorrect:**
```markdown
## Research Summary
The research found that API X supports OAuth 2.0 with rate limit of 100/min...
(inline content pasted from another file)
```

## Module Interaction Rules

1. **Modules do not call other modules directly.** The orchestrator reads modules and composes behavior.
2. **Modules may reference other modules** with "Read `modules/X.md` for details" but the orchestrator decides when to load.
3. **Modules MUST NOT duplicate phase logic.** If a module restates what a phase file says, one of them is wrong.
4. **State flows through files, not through modules.** Modules define HOW to write state; `pipeline/state.json` IS the state.

## Adding a New Module

1. Identify the concern: Is it reusable across phases? If not, it belongs in the phase file.
2. Name it descriptively: `kebab-case-noun.md` matching its primary concern.
3. Follow the standard structure above.
4. Add a reference in the phase file(s) that use it: `Read modules/{name}.md for {purpose}.`
5. Keep under 200 lines. If longer, split or question whether it should be a reference instead.
6. Do NOT add it to core.md unless it is loaded on EVERY phase start (very rare).

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| Module with logic for a single phase | Not reusable -- belongs in the phase file | Move into phase file |
| Module that reads pipeline artifacts directly | Modules define behavior, orchestrator reads artifacts | Module describes what to check; orchestrator executes |
| Module over 300 lines | Context budget violation, likely mixing concerns | Split by concern |
| Module that duplicates core.md rules | Creates divergence risk when one is updated | Reference core.md instead |
| Module with inline code examples >20 lines | Belongs in a template or reference | Extract to appropriate location |
| Module referenced by zero phases | Dead code | Delete it |
