# BRIDGE Development Pipeline

A Claude Code skill that automates the path from business requirements to delivered technical solutions. Built for any team that needs to move faster from "the client said X" to working code with professional deliverables.

## The problem

Every development team repeats the same cycle on every project: sit through a requirements meeting, manually write up what was discussed, research the right technologies, design an architecture, build the solution, review it, and package everything for the client. Each step requires different expertise, and the handoffs between them lose context.

The gap between what a stakeholder describes in a meeting and what actually gets built is where most projects go wrong. Requirements get misinterpreted. Research happens too late. Architecture decisions are made without validated data. By the time someone catches the misalignment, weeks of work need to be redone.

This pipeline addresses that gap by running specialized AI agents through each step, with human review at every stage. You stay in control of every decision, but the agents handle the heavy lifting.

## Who this is for

Any team that handles client projects and needs to compress the time between initial requirements and delivered solutions. Instead of spending days translating meeting notes into technical specs, researching APIs, designing architectures, and packaging deliverables, the pipeline handles the full cycle in a structured, repeatable way.

**Examples:**
- **Software development agencies** building custom applications for clients
- **Data analytics and AI consultancies** delivering dashboards, pipelines, and ML solutions
- **Fractional CTO/engineering teams** that need to produce like a full team with limited people
- **System integrators** connecting platforms like NetSuite, Salesforce, or Dynamics 365
- **Digital transformation consultancies** modernizing client processes
- **Product studios and startups** going from idea to validated MVP
- **Freelancers and contractors** managing multiple client projects simultaneously
- **IT consulting firms** producing technical proposals with real cost estimates

Example: A consulting firm receives a transcript from a client meeting about building a financial dashboard. The pipeline takes that transcript and produces numbered requirements, researches the right cloud services and APIs, designs an architecture with cost estimates, generates the code using TDD, validates everything against the original requirements, and outputs client-ready deliverables (HTML report, PowerPoint, Word doc, Excel). The team reviews and approves at each step.

## What it does

You give it a meeting transcript, email, or requirement summary. It returns:

- **Structured requirements** (functional + non-functional, numbered as REQ-001 through REQ-NNN)
- **Architecture proposal** with component diagrams, Azure/AWS/GCP cost estimates, and implementation phases
- **Solution code** delivered to a client folder, organized by project
- **Client deliverables**: interactive HTML report, PowerPoint presentation, Word document, Excel workbook
- **Quality score** covering requirements coverage, test pass rate, security, code quality, documentation

The pipeline runs 5 phases with human approval gates between each one. You review and approve before it moves forward. You can stop at any phase and get deliverables from what exists so far.

## BRIDGE Framework

The pipeline is built around the BRIDGE framework, developed by [Jose Milton Buitron](https://www.linkedin.com/in/josembuitron/) after observing a recurring pattern in AI project failures: teams jump to solutions before fully understanding the problem. BRIDGE enforces a structured analysis sequence, distributed across specialized agents, to ensure business requirements are deeply understood before any technical work begins.

**B** - Business Challenge (what was said vs what is needed)
**R** - Root Causes (causal chains behind the problem)
**I** - Impact and Symptoms (KPIs, financial exposure, operational friction)
**D** - Data and Context (preliminary from input, then validated by research)
**G** - Generate Use Cases (3-5 specific AI/analytics solutions grounded in validated data)
**E** - Evaluate Feasibility (viability, complexity, timeline, risk, prioritization)

Rather than concentrating all analysis in one agent, BRIDGE phases are distributed where each agent has the right expertise:

```
B --- R --- I --- D(prelim)          D(validated)          G --- E
|--------------------------|         |--------------|      |--------------|
      Phase 1: Translator             Phase 2: Researcher    Phase 3: Architect
      (business analysis)             (tech validation)      (solution design)
```

The Translator focuses on understanding the problem (B, R, I) without proposing solutions. The Researcher validates data assumptions. The Architect, with the full validated context, generates use cases and evaluates feasibility. The Validator checks that the final solution traces back to every identified root cause and impact metric.

Read more: [Why Some AI Projects Start Wrong: The Problem](https://www.linkedin.com/pulse/why-some-ai-projects-start-wrong-problem-jose-milton-buitron-4bbme/)

## Architecture

```
Orchestrator (Claude Code)
|-- Phase 1 - Requirements Translator    -> BRIDGE B,R,I,D-prelim + REQ-NNN requirements
|-- Phase 2 - Research Scout             -> BRIDGE D-validated + technology analysis
|-- Phase 3 - Solution Architect         -> BRIDGE G,E + component design, cost model
|-- Phase 4 - Developer                  -> working code, tests, CI/CD
'-- Phase 5 - Validator                  -> BRIDGE alignment + quality scoring
```

Each phase is a specialized sub-agent. The orchestrator coordinates, humans approve at each gate.

## Tools per phase

| Phase | Agent | Skills/Methodologies | CLI Tools | MCP Servers | Plugins |
|-------|-------|---------------------|-----------|-------------|---------|
| 1. Translate | Requirements Translator | BRIDGE B-R-I-D analysis | -- | sequential-thinking, memory | Context7 |
| 2. Research | Technology Researcher | Tiered doc access | crawl4ai | memory | Context7, Playwright |
| 3. Architect | Solution Architect | Brainstorming, writing-plans | crawl4ai | azure-pricing, aws-pricing, uml, memory | Context7, Playwright, Excalidraw |
| 4. Build | Dynamic Specialists | TDD, subagent-driven-development | vitest, eslint | memory | Context7, Playwright, frontend-design |
| 5. Validate | Validator + PR Review | Verification, systematic debugging | semgrep, lighthouse | gitguardian, memory | pr-review-toolkit (6-pass), code-review |

## Quick Start

### Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- Node.js 18+

### Installation

```bash
# Clone the repo
git clone https://github.com/josembuitron/bridge-agentic-pipeline
cd AI-development-agency

# Open in Claude Code
claude .

# Run the pipeline
/bridge
```

On first run, the pipeline detects missing tools and auto-installs them.

### Optional plugins and tools

Install plugins via Claude Code settings (`/settings` -> Plugins). MCP servers are configured in `.claude/settings.json`. CLI tools are installed automatically on first run.

| Plugin/Tool | Type | Purpose |
|------------|------|---------|
| `superpowers` | Plugin | TDD, planning, code review workflows |
| `pr-review-toolkit` | Plugin | 6-pass code review |
| `context7` | Plugin | Code library documentation |
| `playwright` | Plugin | Browser automation for JS-heavy docs |
| `frontend-design` | Plugin | Production-grade UI components |
| `excalidraw` | MCP | Architecture diagram images (Mermaid to PNG) |
| `azure-pricing` | MCP | Real Azure cost estimation |
| `aws-pricing` | MCP | Real AWS cost estimation |
| `sequential-thinking` | MCP | Structured reasoning for requirements analysis |
| `uml` | MCP | Formal C4/BPMN/ERD diagrams |
| `memory` | MCP | Persistent knowledge graph |
| `gitguardian` | MCP | Secrets detection |
| `semgrep` | CLI | SAST security scanning |
| `lighthouse` | CLI | Performance and accessibility audits |
| `vitest` | CLI | JavaScript/TypeScript test runner |
| `eslint` | CLI | Code quality linting |

## Usage

```
/bridge                    start a new project
/bridge help               show commands and options
/bridge list               list all client projects
/bridge continue <client>  resume an in-progress project
```

Paste any of the following as input:
- Meeting transcript or notes
- Email thread or Slack summary
- Existing requirements document
- Verbal description of what needs to be built

## What gets delivered

All output is organized under `clients/<client-name>/<project>/`:

```
clients/
'-- acme-corp/
    '-- crm-dashboard/
        |-- requirements/          <- REQ-001 through REQ-NNN
        |-- architecture/          <- diagrams, cost model, ADRs
        |-- solution/              <- working code + tests
        |-- pipeline/              <- quality-score.json, feedback-routing.json
        '-- deliverables/
            |-- report.html        <- interactive HTML (D3 charts, filterable)
            |-- presentation.pptx  <- executive presentation
            |-- proposal.docx      <- Word document
            '-- estimates.xlsx     <- cost and phase breakdown
```

## Configuration

### Brand assets

On first run, the pipeline creates `brand-assets/brand-config.json`. Edit it to set your company name, colors, and logo path. All deliverables will use your brand.

### Workspace location

The pipeline asks for your workspace path on first run and saves it to `~/.daai-workspace`. Change it anytime by editing that file.

## Skills included

| Skill | Purpose |
|-------|---------|
| `bridge` | Main orchestrator, runs the full pipeline |
| `requirements-translator` | Translates unstructured input into structured REQs |
| `research-scout` | Technology research and API/tool investigation |
| `solution-architect` | Architecture design with component diagrams |
| `code-validator` | Validates code against requirements and quality standards |
| `gh-cli` | GitHub CLI operations |

## Repository layout

```
.claude/
|-- agents/          <- Agent definitions loaded by Claude Code
'-- commands/        <- /bridge slash command
.claude-plugin/      <- Plugin metadata (name, version, skills path)
skills/              <- All skill SKILL.md files
agents/              <- Agent definitions (reference copy)
templates/           <- Output format templates
docs/                <- Domain knowledge docs
hooks/               <- Claude Code hooks
brand-assets/        <- Brand configuration and templates
CLAUDE.md            <- Project-level Claude instructions
SETUP.md             <- Detailed setup guide
README.md            <- This file
```

## Support

If this project saves you time, consider supporting its development:

<a href="https://www.buymeacoffee.com/josembuitron" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="40" width="170"></a>

## License

MIT
