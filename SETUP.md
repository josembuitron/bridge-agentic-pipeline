# BRIDGE Pipeline - Setup Guide

## Prerequisites

### Required: Claude Code
This skill runs inside [Claude Code](https://claude.com/claude-code). Install it first.

### Required: Claude Code Plugins
Enable these plugins in Claude Code settings (`/settings`):

| Plugin | Purpose | How to enable |
|--------|---------|---------------|
| `superpowers` | Development workflows (TDD, planning, code review) | Settings > Plugins > superpowers |
| `crawl4ai` | Web scraping, doc extraction, research (free CLI, no plugin needed) | `pip install -U crawl4ai && crawl4ai-setup` |
| `context7` | Code library documentation (React, Node, Python, etc.) | Settings > Plugins > context7 |
| `playwright` | Browser automation for interactive/JS-heavy sites | Settings > Plugins > playwright |

### Required: CLI Tools

```bash
# Research tools
npm install -g @aisuite/chub                    # Context Hub (curated API docs) -- FREE
pip install -U crawl4ai && crawl4ai-setup       # crawl4ai (web scraping) -- FREE

# Deliverable generation tools
pip install pandoc                               # Markdown → Word/PDF -- FREE
npm install -g pptxgenjs                         # PowerPoint generation -- FREE
npm install -g exceljs                           # Excel generation -- FREE
```

**Note:** The pipeline auto-installs missing CLI tools on first run. You can skip manual installation -- just run `/bridge` and it will detect and install what's needed.

### Authentication Requirements

| Tool | Needs Auth? | How | Free Tier? |
|------|:-----------:|-----|:----------:|
| **crawl4ai** | No | `pip install -U crawl4ai && crawl4ai-setup` | Free (open-source, local) |
| **Greptile** | **YES** | `GREPTILE_API_KEY` (from app.greptile.com/settings/api) | Yes (limited) |
| Context Hub | No | -- | Free |
| Context7 MCP | No | -- | Free |
| Playwright MCP | No | -- | Free |
| WebSearch/WebFetch | No | Built-in | Always available |

**Without authentication**, Greptile is installed but non-functional. The pipeline will use fallback tools automatically. crawl4ai is completely free and local -- no API key or auth needed. The pipeline auto-detects tool availability at startup and will guide you through setup.

### Optional: Architecture Diagram Images (Excalidraw MCP)

Excalidraw MCP enables the pipeline to convert Mermaid architecture diagrams into professional PNG/SVG images with platform-specific icons (Azure, AWS, GCP, Kubernetes).

```bash
# Install via Claude Code MCP
claude mcp add excalidraw -- npx mcp_excalidraw

# Or install globally
npm install -g mcp_excalidraw
```

- **Requires**: Node.js 18+
- **No API key needed** -- free, open-source, runs locally
- **If not installed**: Pipeline works fine -- diagrams remain as Mermaid markdown
- **Canvas server**: Runs on port 3000 when active (for visual editing)
- **Icon libraries**: Azure, AWS, GCP, Kubernetes, databases available at libraries.excalidraw.com

### Recommended: Additional Plugins

| Plugin | Purpose | Setup |
|--------|---------|-------|
| `pr-review-toolkit` | Deep 6-pass PR review (comments, tests, errors, types, code, simplify) | Settings > Plugins > pr-review-toolkit |
| `greptile` | AI code review + semantic code search via MCP | Settings > Plugins > greptile + set `GREPTILE_API_KEY` (get at https://app.greptile.com/settings/api) |
| `code-review` | Automated multi-agent code review | Settings > Plugins > code-review |
| `frontend-design` | Production-grade UI design | Settings > Plugins > frontend-design |
| `skill-creator` | Create new skills from documentation | Settings > Plugins > skill-creator |

## Installation

1. Clone or copy this directory to your workspace
2. Open the directory in Claude Code: `claude .`
3. Run the pipeline: `/bridge`

## What's Inside

```
bridge-agentic-pipeline/
├── .claude/                    ← Claude Code integration
│   ├── agents/                 ← Core agent definitions (4 agents)
│   └── commands/               ← Slash command (/bridge)
├── .claude-plugin/             ← Plugin metadata
├── agents/                     ← Agent definitions (plugin distribution copy)
├── skills/
│   └── bridge/                 ← Pipeline orchestrator skill
│       ├── SKILL.md            ← Entry point
│       ├── orchestrator/
│       │   ├── core.md         ← Pipeline core (responsibilities, rules, flow)
│       │   ├── phases/         ← Phase files (00 through 05)
│       │   └── modules/        ← Feature modules (context-budget, cost-tracking, etc.)
│       └── references/         ← Reference prompts (ojo-critico)
├── templates/                  ← Output format templates
├── docs/
│   ├── domain-knowledge/       ← Domain expertise docs
│   └── reference/              ← CLI tool reference docs (crawl4ai, semgrep, etc.)
├── CLAUDE.md                   ← Project instructions
└── clients/                    ← Pipeline output organized by client (created at runtime)
```

## Documentation Access Stack

The pipeline uses a tiered approach for accessing any documentation online:

```
Tier 1: Context7 MCP          → Code libraries (React, Node, Python packages)
Tier 2: DeepWiki MCP           → GitHub repo documentation (optional plugin)
Tier 3: crawl4ai CLI           → ANY online docs (NetSuite, Azure, Salesforce, etc.) -- free, no auth
Tier 4: Playwright MCP         → Interactive/JS-heavy/auth-gated sites
Tier 5: Context Hub CLI        → Curated API docs (Stripe, Twilio, AWS, etc.)
Tier 6: WebSearch + WebFetch   → Fallback for everything else
```

## Verification

After setup, run `/bridge` and it will auto-detect which tools are available. Missing tools will be flagged with installation instructions.

## Usage Tips

### Partial Execution
You don't need to run the full pipeline. Tell BRIDGE what you need:
- "Just translate the requirements" -- runs only Phase 1
- "Only do research" -- runs only Phase 2
- "Skip to architecture" -- runs Phase 3
- "Resume project X" -- picks up where you left off

BRIDGE uses `flexible-execution.md` to detect what exists and what's missing, offering options at each step.

### Context Window Management During Long Runs
- **`/btw`** -- Ask side questions without adding to conversation history. Useful for checking something mid-pipeline without polluting the orchestrator's context.
- **`/compact`** -- Manually trigger context compaction between phases if responses start feeling repetitive or generic. You can add focus: `/compact focus on architecture decisions and build progress`.
- **`/clear`** -- Reset context entirely between unrelated tasks. Do NOT use mid-pipeline -- use `/compact` instead.

### Self-Test
Run `bridge self-test` or `bridge test` to validate the pipeline's structural integrity without running a full project. This checks that all referenced files, templates, agents, and docs exist.
