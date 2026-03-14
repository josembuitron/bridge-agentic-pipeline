# DA&AI Agentic Development Workflow

A Claude Code skill that runs a complete multi-agent pipeline — from raw business requirements to delivered technical solutions with client-ready deliverables.

## What it does

You give it a meeting transcript, email, or requirement summary. It returns:

- **Structured requirements** (functional + non-functional, numbered)
- **Architecture proposal** with component diagrams, Azure/AWS/GCP cost estimates, and implementation phases
- **Solution code** (delivered to a client folder, organized by project)
- **Client deliverables**: interactive HTML report, PowerPoint presentation, Word document, Excel workbook
- **Quality score** (requirements coverage, test pass rate, security, code quality, documentation)

The pipeline runs 5 phases with human approval gates between each one. You review and approve before it moves forward.

## Architecture

```
Orchestrator (Claude Code)
├── Phase 1 — Requirements Translator    → structured REQ-NNN requirements
├── Phase 2 — Research Scout             → technology analysis, market context
├── Phase 3 — Solution Architect         → component design, cost model, phases
├── Phase 4 — Developer                  → working code, tests, CI/CD
└── Phase 5 — Validator                  → quality scoring, feedback routing
```

Each phase is a specialized sub-agent. The orchestrator coordinates, humans approve at each gate.

## Quick Start

### Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- Node.js 18+

### Installation

```bash
# Clone the repo
git clone https://github.com/josembuitron/AI-development-agency
cd AI-development-agency

# Open in Claude Code
claude .

# Run the pipeline
/daai-pipeline
```

On first run, the pipeline detects missing tools and auto-installs them.

### Optional plugins (recommended)

Install via Claude Code settings (`/settings` → Plugins):

| Plugin | Purpose |
|--------|---------|
| `superpowers` | TDD, planning, code review workflows |
| `pr-review-toolkit` | 6-pass code review (comments, tests, types, errors, style) |
| `context7` | Code library documentation |
| `frontend-design` | Production-grade UI components |

## Usage

```
/daai-pipeline                    — start a new project
/daai-pipeline help               — show commands and options
/daai-pipeline list               — list all client projects
/daai-pipeline continue <client>  — resume an in-progress project
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
└── acme-corp/
    └── crm-dashboard/
        ├── requirements/          ← REQ-001 through REQ-NNN
        ├── architecture/          ← diagrams, cost model, ADRs
        ├── solution/              ← working code + tests
        ├── pipeline/              ← quality-score.json, feedback-routing.json
        └── deliverables/
            ├── report.html        ← interactive HTML (D3 charts, filterable)
            ├── presentation.pptx  ← executive presentation
            ├── proposal.docx      ← Word document
            └── estimates.xlsx     ← cost and phase breakdown
```

## Configuration

### Brand assets

On first run, the pipeline creates `brand-assets/brand-config.json`. Edit it to set your company name, colors, and logo path — all deliverables will use your brand.

### Workspace location

The pipeline asks for your workspace path on first run and saves it to `~/.daai-workspace`. Change it anytime by editing that file.

## Skills included

| Skill | Purpose |
|-------|---------|
| `daai-pipeline` | Main orchestrator — runs the full pipeline |
| `requirements-translator` | Translates unstructured input into structured REQs |
| `research-scout` | Technology research and API/tool investigation |
| `solution-architect` | Architecture design with component diagrams |
| `code-validator` | Validates code against requirements and quality standards |
| `gh-cli` | GitHub CLI operations |

## Repository layout

```
.claude/
├── agents/          ← Agent definitions loaded by Claude Code
└── commands/        ← /daai-pipeline slash command
.claude-plugin/      ← Plugin metadata (name, version, skills path)
skills/              ← All skill SKILL.md files
agents/              ← Agent definitions (reference copy)
templates/           ← Output format templates
docs/                ← Domain knowledge docs
hooks/               ← Claude Code hooks
brand-assets/        ← Brand configuration and templates
CLAUDE.md            ← Project-level Claude instructions
SETUP.md             ← Detailed setup guide
README.md            ← This file
```

## License

MIT
