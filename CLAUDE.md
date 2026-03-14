# DA&AI Agentic Development Workflow

## Overview

This plugin implements a multi-agent pipeline that transforms business requirements (from meeting transcripts, emails, chats, or summaries) into delivered technical solutions. The system uses dynamic agent orchestration with human approval gates at every phase.

## How It Works

Run `/daai-pipeline` (slash command in `.claude/commands/`) to start. The pipeline has 6 phases:

1. **INPUT** — User provides a requirement (paste text, file path, or describe)
2. **TRANSLATE** — Converts business language into a structured Technical Definition
3. **RESEARCH** — Investigates all technologies, APIs, tools, MCPs, and methodologies needed
4. **ARCHITECT** — Designs the solution architecture and specifies which specialist agents are needed
5. **BUILD** — Dynamically creates/updates specialist agents and they build the solution
6. **VALIDATE** — Tests, reviews, and approves or rejects with feedback loops

Every phase has a **human approval gate** — the user reviews output and decides to approve, modify, or reject before proceeding.

## Agent Ecosystem

### Core Agents (in `.claude/agents/`)
- `requirements-translator` — Extracts structured requirements from unstructured input
- `researcher` — Fetches latest docs, evaluates tools, APIs, MCPs
- `solution-architect` — Designs architecture and specifies the agent team needed
- `validator` — Quality gate that approves or rejects with specific feedback

### Specialist Agents (created/updated dynamically)
- Files matching `spec-*.md` in the `.claude/agents/` directory
- Created by the orchestrator when first needed based on Architect's specifications
- Updated with latest documentation on subsequent runs
- Persist between runs and accumulate knowledge via `memory: project`
- For the CURRENT session when a new specialist is first created, the orchestrator passes the full specialist prompt to a `general-purpose` subagent (since new .md files require session restart to be discovered). The .md file is written for FUTURE sessions.

## Directory Structure

### Claude Code Integration
- `.claude/agents/` — All agent definitions (core + dynamically created specialists)
- `.claude/commands/daai-pipeline.md` — Main slash command entry point
- `CLAUDE.md` — Project instructions (this file)

### Reference Materials
- `templates/` — Output format templates
- `docs/domain-knowledge/` — Domain expertise docs
- `skills/` — Sub-skill reference methodology docs

## Project Output Structure

Projects are organized by client, then by project name:
```
clients/
  {client-slug}/                       ← Client folder (persists across projects)
    {project-slug}/                    ← Project folder
      README.md                        ← Project name, client, creation date, status
      input/                           ← Original requirement (copied)
      pipeline/
      │   ├── 01-technical-definition.md     ← From Translator
      │   ├── 02-research-report.md          ← From Researcher
      │   ├── 03-solution-proposal.md        ← From Architect
      │   ├── 04-build-manifest.md           ← What was built by whom
      │   └── 05-validation-report.md        ← Final quality report
      src/                             ← Built solution code
      tests/                           ← Test suites
      docs/                            ← Deliverable documentation
      deliverables/                    ← Client-facing summary report (sanitized)
        images/                        ← Architecture diagram images (PNG/SVG, if Excalidraw available)
```

The pipeline auto-detects client and project names from input, reuses existing client folders, and validates whether a project already exists before creating a new one.

## Key Design Principles

1. **Human in the loop** — Every phase requires explicit human approval before proceeding
2. **Agents learn** — All agents use `memory: project` to accumulate knowledge across runs
3. **Dynamic composition** — Specialist agents are created/updated per project needs, not predefined
4. **Latest docs always** — Researcher fetches current API docs every run; specialists are updated accordingly
5. **Client-ready output** — Every project produces shareable documentation and reports
6. **Rejection routing** — Validator can reject and route back to any agent with specific feedback
