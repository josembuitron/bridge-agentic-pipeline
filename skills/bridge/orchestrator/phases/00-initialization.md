# Phase 0: Initialization

## Step 0.HELP - Help & Configuration Guide (if user asks for help)

If the user invokes the skill with "help", "setup", "configure", or asks "how do I set this up?", present this guide instead of running the pipeline:

```
=== BRIDGE Pipeline — Setup & Configuration Guide ===

📁 FOLDER STRUCTURE
The pipeline organizes work in your workspace directory:

  {WORKSPACE}/
  ├── clients/{client}/{project}/             ← Project deliverables
  │   ├── pipeline/      ← Internal technical artifacts
  │   ├── deliverables/  ← Client-facing documents (sanitized)
  │   ├── src/           ← Built code (if Phase 4 runs)
  │   └── input/         ← Original requirements
  │
  └── brand-assets/                          ← Your brand guidelines
      ├── brand-config.json                  ← Colors, fonts, logo
      └── templates/
          ├── presentation.pptx              ← Your PowerPoint template
          ├── report.docx                    ← Your Word template
          └── report.css                     ← CSS for HTML reports

Your current workspace: {run `pwd` and show result}
To change workspace: The pipeline will ask on first run, or edit ~/.bridge-workspace

🎨 BRAND GUIDELINES
Edit brand-assets/brand-config.json with your company's colors and fonts.
Add branded .pptx and .docx templates to brand-assets/templates/.
If no brand assets exist, the pipeline creates defaults on first run.

🔧 TOOLS (auto-installed on first run)
Research: crawl4ai, Context Hub CLI, Context7 MCP, Playwright MCP
Deliverables: pandoc (Word), pptxgenjs (PowerPoint), exceljs (Excel)
All free, no API keys needed.

📋 COMMANDS
  /bridge              ← Start a new project or continue existing
  /bridge help         ← Show this guide
  /bridge list         ← List all projects
  /bridge dream {client}    ← Consolidate knowledge graph for a client
  /bridge dream all-tooling ← Consolidate global tooling patterns

🏗️ PIPELINE PHASES
  Phase 1: Translate requirements → Technical Definition
  Phase 2: Research technologies → Research Report
  Phase 3: Design architecture → Solution Proposal + Diagrams
  Phase 4: Build solution → Code + Tests
  Phase 5: Validate & deliver → Client-ready deliverables

You can stop at any phase and get deliverables for what's completed.
```

Then STOP — do not run the pipeline.

---

## Step 0.DREAM - Dream Consolidation (if user invokes `/bridge dream`)

If the user invokes the skill with "dream", `/bridge dream {client}`, or `/bridge dream all-tooling`:

1. Read `modules/dream-consolidation.md` for the full protocol
2. If `{client-slug}` is provided: spawn the Level 1 agent for that client
3. If no argument: list all clients with `.knowledge/` directories, ask which one
4. If `all-tooling`: run the Level 2 global tooling consolidation
5. After completion: present the consolidation report to the user

Then STOP — do not run the pipeline.

---

## Step 0.0 - Resource & Tool Discovery (RUN FIRST)

### Step 0.0a - Locate Pipeline Resources

Templates, agents, and domain knowledge docs ship with the plugin. Find them:
```bash
for dir in "$HOME/.claude/skills/bridge" "bridge-workspace" "bridge-pipeline" "."; do
  if [ -d "$dir/templates" ] && [ -f "$dir/templates/technical-definition.md" ]; then
    echo "PIPELINE_RESOURCES=$dir"
    break
  fi
done
```

Store as `PIPELINE_RESOURCES`. When referencing `templates/technical-definition.md`, read from `{PIPELINE_RESOURCES}/templates/technical-definition.md`.

**Also check for cross-run lessons (returning project):**
```bash
ls clients/{client-slug}/{project-slug}/pipeline/lessons/*.md 2>/dev/null
```
If lessons exist, read and include summary in context passed to each phase agent.

**Also check for brand assets:**
```bash
if [ -d "brand-assets" ] && [ -f "brand-assets/brand-config.json" ]; then
  echo "BRAND_ASSETS=available"
else
  echo "BRAND_ASSETS=not_configured"
fi
```

### Step 0.0b - Tool Discovery

**IMPORTANT — Cross-platform detection:** Tools install differently across OS and package managers. A single check is unreliable. For each tool, run a **fallback chain** — stop at the first success.

```bash
# ── Helper: detect_tool runs a fallback chain, returns first success ──
detect_tool() {
  local name="$1"; shift
  for cmd in "$@"; do
    if eval "$cmd" >/dev/null 2>&1; then
      echo "${name}=ready"
      return 0
    fi
  done
  echo "${name}=not_installed"
  return 1
}

# ═══════════════════════════════════════════════════════════
# 1. crawl4ai (pip package — CLI may not be in PATH)
# ═══════════════════════════════════════════════════════════
detect_tool "CRAWL4AI" \
  "crwl --version" \
  "python -m crawl4ai --version" \
  "python3 -m crawl4ai --version" \
  "python -c \"import crawl4ai; print(crawl4ai.__version__)\""

# ═══════════════════════════════════════════════════════════
# 2. semgrep (pip package — binary may not be in PATH)
# ═══════════════════════════════════════════════════════════
detect_tool "SEMGREP" \
  "semgrep --version" \
  "python -m semgrep --version" \
  "python3 -m semgrep --version" \
  "python -c \"import semgrep\""

# ═══════════════════════════════════════════════════════════
# 3. pandoc (system package)
# ═══════════════════════════════════════════════════════════
detect_tool "PANDOC" \
  "command -v pandoc" \
  "pandoc --version" \
  "where pandoc"

# ═══════════════════════════════════════════════════════════
# 4. pptxgenjs (npm global — require() only finds local)
# ═══════════════════════════════════════════════════════════
detect_tool "PPTXGENJS" \
  "npm list -g pptxgenjs" \
  "node -e \"require('pptxgenjs')\"" \
  "npx --no-install pptxgenjs --help"

# ═══════════════════════════════════════════════════════════
# 5. exceljs (npm global — same issue as pptxgenjs)
# ═══════════════════════════════════════════════════════════
detect_tool "EXCELJS" \
  "npm list -g exceljs" \
  "node -e \"require('exceljs')\"" \
  "npx --no-install exceljs --help"

# ═══════════════════════════════════════════════════════════
# 6. Remotion (npm global — require() misses globals)
# ═══════════════════════════════════════════════════════════
detect_tool "REMOTION" \
  "npx --no-install remotion --version" \
  "npm list -g @remotion/cli" \
  "npm list -g remotion" \
  "node -e \"require('remotion')\""

# ═══════════════════════════════════════════════════════════
# 7. Architecture diagram tools
# ═══════════════════════════════════════════════════════════
detect_tool "DIAGRAMS" \
  "python -c \"import diagrams\"" \
  "python3 -c \"import diagrams\""

detect_tool "GRAPHVIZ" \
  "dot -V" \
  "command -v dot" \
  "where dot"

detect_tool "D2" \
  "command -v d2" \
  "d2 --version" \
  "where d2"

# ═══════════════════════════════════════════════════════════
# 8. Context Hub CLI
# ═══════════════════════════════════════════════════════════
detect_tool "CONTEXTHUB" \
  "npx --no-install @aisuite/chub --help"

# ═══════════════════════════════════════════════════════════
# 9. JS/TS test & quality tools
# ═══════════════════════════════════════════════════════════
detect_tool "VITEST" \
  "npx --no-install vitest --version" \
  "npm list -g vitest" \
  "node -e \"require('vitest')\""

detect_tool "ESLINT" \
  "npx --no-install eslint --version" \
  "npm list -g eslint" \
  "node -e \"require('eslint')\""

detect_tool "LIGHTHOUSE" \
  "npx --no-install lighthouse --version" \
  "npm list -g lighthouse" \
  "command -v lighthouse"

detect_tool "STRYKER" \
  "npx --no-install stryker --version" \
  "npm list -g @stryker-mutator/core" \
  "node -e \"require('@stryker-mutator/core')\""

detect_tool "PIXELMATCH" \
  "npm list -g pixelmatch" \
  "node -e \"require('pixelmatch')\""

# ═══════════════════════════════════════════════════════════
# 10. Python toolchain (modern-python: uv, ruff, ty, pytest)
# ═══════════════════════════════════════════════════════════
detect_tool "UV" \
  "uv --version" \
  "command -v uv" \
  "where uv"

detect_tool "RUFF" \
  "ruff --version" \
  "command -v ruff" \
  "python -m ruff --version" \
  "python3 -m ruff --version"

detect_tool "TY" \
  "ty --version" \
  "command -v ty" \
  "python -m ty --version"

detect_tool "PYTEST" \
  "pytest --version" \
  "python -m pytest --version" \
  "python3 -m pytest --version"

# ═══════════════════════════════════════════════════════════
# 11. gh CLI (GitHub)
# ═══════════════════════════════════════════════════════════
detect_tool "GH_CLI" \
  "gh --version" \
  "command -v gh" \
  "~/.local/bin/gh --version"

# 12. WebSearch/WebFetch — ALWAYS AVAILABLE

# ═══════════════════════════════════════════════════════════
# 13. Cache NPM_GLOBAL_PATH (used by ALL downstream agents)
# ═══════════════════════════════════════════════════════════
NPM_GLOBAL_PATH=$(npm root -g 2>/dev/null)
if [ -n "$NPM_GLOBAL_PATH" ]; then
  echo "NPM_GLOBAL_PATH=$NPM_GLOBAL_PATH"
  export NPM_GLOBAL_PATH
else
  echo "NPM_GLOBAL_PATH=unknown"
fi
```

**IMPORTANT:** `NPM_GLOBAL_PATH` MUST be passed in the prompt context of EVERY agent that generates Node.js scripts. Without it, `require()` calls for globally installed packages (pptxgenjs, exceljs, remotion) will fail on Windows.

**Why fallback chains?** On Windows: pip installs binaries to `%APPDATA%/Python/Scripts/` (often not in Git Bash PATH), npm globals live outside `node_modules/` (invisible to `require()`), and `which` is unavailable in some shells. The chain tries the binary first, then the package manager, then the Python import — stopping at first success.

### Step 0.0b-2 — MCP Server Detection (NOT shell-based)

MCP servers are NOT detected via shell commands. The orchestrator checks availability by attempting to use ToolSearch to find each MCP's tools. If a tool resolves, the MCP is connected.

**Detection method:** The orchestrator calls `ToolSearch` with each MCP tool prefix and records availability.

```
MCP Detection Checklist (orchestrator runs these checks inline, NOT via Bash):

| MCP Server         | Probe Tool                                              | Variable            |
|--------------------|--------------------------------------------------------|---------------------|
| Playwright         | ToolSearch: "mcp__plugin_playwright_playwright__browser_navigate" | PLAYWRIGHT_MCP    |
| Context7           | ToolSearch: "mcp__plugin_context7_context7__resolve-library-id"  | CONTEXT7_MCP      |
| Excalidraw         | ToolSearch: "mcp__excalidraw__create_from_mermaid"       | EXCALIDRAW_MCP      |
| azure-pricing      | ToolSearch: "mcp__azure-pricing"                         | AZURE_PRICING_MCP   |
| aws-pricing        | ToolSearch: "mcp__aws-pricing"                           | AWS_PRICING_MCP     |
| sequential-thinking| ToolSearch: "mcp__sequential-thinking"                   | SEQ_THINKING_MCP    |
| uml                | ToolSearch: "mcp__uml"                                   | UML_MCP             |
| memory             | ToolSearch: "mcp__memory"                                | MEMORY_MCP          |
| gitguardian        | ToolSearch: "mcp__gitguardian"                           | GITGUARDIAN_MCP     |
| serena             | ToolSearch: "mcp__serena"                                | SERENA_MCP          |
| deepwiki           | ToolSearch: "mcp__deepwiki"                              | DEEPWIKI_MCP        |
| code-review-graph  | ToolSearch: "mcp__code-review-graph"                     | CODE_REVIEW_GRAPH   |
| Greptile           | Env var check: $GREPTILE_API_KEY                         | GREPTILE_MCP        |

For each: if ToolSearch returns a tool definition → "ready". If empty → "not_installed".
Greptile additionally needs the API key to be set.
```

**IMPORTANT:** Do NOT attempt to auto-install MCP servers. They require interactive plugin setup. Only REPORT availability and note impact if missing.

### Step 0.0b-3 — Plugin & Skill Detection

Plugins and skills are detected differently from CLI tools. The orchestrator checks by reading the available skills list from the system context.

```
Plugin Detection Checklist:

CRITICAL plugins (pipeline degraded without them):
| Plugin               | How to detect                             | Impact if missing |
|----------------------|------------------------------------------|-------------------|
| superpowers          | Skill list contains "superpowers:*"       | HIGH — no methodology guidance |
| pr-review-toolkit    | Skill list contains "pr-review-toolkit:*" | HIGH — no 6-pass PR review |

HIGH plugins (features reduced without them):
| Plugin               | How to detect                             | Impact if missing |
|----------------------|------------------------------------------|-------------------|
| context7             | CONTEXT7_MCP is "ready" (from MCP check) | Reduced library doc access |
| playwright           | PLAYWRIGHT_MCP is "ready"                 | No browser automation |
| serena               | SERENA_MCP is "ready"                     | No LSP code intelligence |
| code-review          | Skill list contains "code-review:*"       | No GitHub PR auto-comments |
| frontend-design      | Skill list contains "frontend-design:*"   | Generic UI patterns |

Trail of Bits skills (check ALL 35 — see available-plugins.md):
| Category             | Skills to check                           | How to detect |
|----------------------|------------------------------------------|---------------|
| Always Active (8)    | static-analysis, supply-chain-risk-auditor, entry-point-analyzer, audit-context-building, sharp-edges, differential-review, insecure-defaults, fp-check | Skill list contains each name |
| Triggered (9)        | property-based-testing, testing-handbook-skills, spec-to-code-compliance, variant-analysis, semgrep-rule-creator, semgrep-rule-variant-creator, ask-questions-if-underspecified, second-opinion, agentic-actions-auditor | Skill list contains each name |
| Domain (5)           | building-secure-contracts, constant-time-analysis, zeroize-audit, firebase-apk-scanner (no seatbelt on Windows) | Skill list contains each name |
| Supply Chain (3)     | yara-authoring, burpsuite-project-parser, dwarf-expert | Skill list contains each name |
| Dev Tooling (6)      | modern-python, devcontainer-setup, gh-cli, git-cleanup, workflow-skill-design, skill-improver | Skill list contains each name |
| Troubleshooting (1)  | claude-in-chrome-troubleshooting          | Skill list contains name |

Detection method: The orchestrator reads the system-reminder skill list injected at
conversation start. Every skill listed there is available. Skills NOT in the list
are not installed.
```

**Report format for all categories:**

```
=== BRIDGE Tool Discovery Results ===

CLI Tools (18):
  ✅ crawl4ai    ✅ semgrep     ✅ pandoc      ✅ vitest
  ✅ eslint      ✅ lighthouse  ✅ gh          ✅ pptxgenjs
  ✅ exceljs     ✅ remotion    ✅ diagrams    ✅ graphviz
  ✅ d2          ✅ pytest      ✅ uv          ✅ ruff
  ○ stryker     ○ pixelmatch

MCP Servers (13):
  ✅ Context7    ✅ Playwright  ✅ memory      ✅ azure-pricing
  ✅ sequential-thinking  ✅ gitguardian  ○ Excalidraw
  ○ serena      ○ greptile    ○ deepwiki    ○ aws-pricing
  ○ uml         ○ code-review-graph

Plugins (7):
  ✅ superpowers     ✅ pr-review-toolkit  ✅ code-review
  ✅ frontend-design ✅ feature-dev        ○ sourcegraph
  ○ greptile

Trail of Bits Skills (35):
  ✅ 32/35 installed  ○ Missing: seatbelt-sandboxer, culture-index, debug-buttercup (N/A)

Summary: {X}/{Y} tools ready | {N} critical missing | {M} optional missing
```

**Only show the full breakdown if there are gaps.** If everything is installed, collapse to:
```
Tools: 18/18 CLIs ✅ | 13/13 MCPs ✅ | 7/7 plugins ✅ | 32/35 ToB skills ✅ (3 N/A)
```

### Tool Auth Requirements

| Tool | Needs API Key? | Impact if Missing |
|------|:-:|---|
| **crawl4ai** | No | HIGH — primary doc access |
| **Context Hub** | No | LOW |
| **Context7/Playwright MCP** | No | LOW/MEDIUM |
| **Greptile MCP** | **YES** ($GREPTILE_API_KEY) | LOW — enhancement only |
| **Excalidraw MCP** | No | LOW — Mermaid stays as markdown |
| **gitguardian MCP** | No (uses plugin auth) | MEDIUM — secrets detection in Phase 5 |
| **azure/aws-pricing MCP** | No | MEDIUM — cost estimation fallback to manual |
| **serena MCP** | No | LOW — LSP intelligence, degrade gracefully |
| **WebSearch/WebFetch** | No | N/A — always available |
| **Trail of Bits skills** | No | HIGH (always-active 8) / LOW (domain-specific) |
| **superpowers plugin** | No | HIGH — methodology guidance for all phases |

**Present results clearly.** Show ✅ for available, ⚠️ for missing critical, ○ for missing optional.

**CRITICAL TOOLS (warn if missing — these significantly degrade quality):**
| Tool | Why Critical | Auto-install? |
|------|-------------|---------------|
| **crawl4ai** | Primary doc access for Phase 2 research | Yes (pip) |
| **semgrep** | SAST security scanning in Phase 4+5 | Yes (pip) |
| **vitest** or test runner | TDD cycle in Phase 4 (JS/TS projects) | Yes (npm) |
| **eslint** | Code quality in Phase 4+5 (JS/TS projects) | Yes (npm) |
| **graphviz** (`dot`) | Required by `diagrams` Python for SVG generation | Yes (choco/brew/apt) |
| **pytest** | TDD cycle in Phase 4 (Python projects) | Yes (pip) |

If ANY critical tool is missing after auto-install attempt, present a warning:
```
⚠️ CRITICAL TOOLS MISSING — Pipeline will run but with reduced capabilities:
  - {tool}: {impact if missing}

Install now? (recommended)
  a) Yes, install all missing critical tools
  b) Continue without — I accept reduced quality
```

**The user MUST acknowledge the gap — do not silently skip critical tools.**

**HIGH-VALUE TOOLS (recommend once, don't block):**
| Tool | Impact | When Needed |
|------|--------|-------------|
| **Playwright MCP** | Live browser testing | Phase 4 (frontend) |
| **Context7 MCP** | Library docs | Phase 2 research |
| **Excalidraw MCP** | Architecture diagrams | Phase 3 |
| **gh CLI** | GitHub integration | Phase 5 PR review |
| **pandoc** | Word doc generation | Phase 5 deliverables |

For missing high-value tools, show once and move on. **NEVER block the pipeline on optional tools.**

**Fallback chain**: crawl4ai → Playwright → Context Hub → Context7 → WebSearch/WebFetch → training knowledge (flag as unverified)

**Store session variables:**
```
AVAILABLE_CLI_TOOLS: [list of confirmed CLI tools]
AVAILABLE_MCP_SERVERS: [list of confirmed MCP servers]
AVAILABLE_PLUGINS: [list of confirmed plugins]
AVAILABLE_TOB_SKILLS: [list of confirmed Trail of Bits skills]
PREFERRED_WEB_METHOD: crawl4ai (if installed) | playwright | websearch
FALLBACK_CHAIN: crawl4ai → playwright → context-hub → context7 → websearch → training-knowledge
```

**Pass tool availability to EVERY agent prompt:**
```
## Available Tools
CLI tools confirmed: {AVAILABLE_CLI_TOOLS}
MCP servers confirmed: {AVAILABLE_MCP_SERVERS}
Doc access method: {PREFERRED_WEB_METHOD}
Fallback chain: {FALLBACK_CHAIN}
If preferred tool denied, try next in chain. If ALL fail, use training knowledge and mark "⚠️ UNVERIFIED"
```

**Pass security skill availability to Phase 4+5 agents:**
```
## Security Skills Available
Trail of Bits: {AVAILABLE_TOB_SKILLS}
If a skill is not available, embed equivalent guidance from docs/reference/ instead.
```

### Step 0.0c - Smart Plugin Check

Read `modules/available-plugins.md` for the full reference table of all plugins, MCP servers, and CLI tools.

```bash
claude plugins list 2>/dev/null | grep "❯" | awk '{print $2}' | sort
```

Compare against Bridge's recommended plugin list (in `modules/available-plugins.md`). Only show gaps. If all CRITICAL and HIGH priority plugins are present: `Plugins: all recommended ✅` and move on.

**Auto-install CLI tools if missing** (present plan first, run all installs in single Bash).

**Use the same `detect_tool` results from Step 0.0b.** Only install tools that returned `not_installed`.

```bash
# ── Cross-platform installer: tries platform-appropriate methods ──

# pip packages — use pip or pip3 (whichever exists)
PIP_CMD=$(command -v pip3 2>/dev/null || command -v pip 2>/dev/null || echo "python -m pip")

if [ "$CRAWL4AI" = "not_installed" ]; then
  $PIP_CMD install -U crawl4ai 2>/dev/null
  python -m crawl4ai.install 2>/dev/null || crawl4ai-setup 2>/dev/null
fi

if [ "$SEMGREP" = "not_installed" ]; then
  $PIP_CMD install semgrep 2>/dev/null
fi

if [ "$DIAGRAMS" = "not_installed" ]; then
  $PIP_CMD install diagrams 2>/dev/null
fi

if [ "$PYTEST" = "not_installed" ]; then
  $PIP_CMD install pytest 2>/dev/null
fi

if [ "$UV" = "not_installed" ]; then
  $PIP_CMD install uv 2>/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh 2>/dev/null
fi

if [ "$RUFF" = "not_installed" ]; then
  $PIP_CMD install ruff 2>/dev/null
fi

# npm globals — use npm install -g
if [ "$PPTXGENJS" = "not_installed" ]; then
  npm install -g pptxgenjs 2>/dev/null
fi

if [ "$EXCELJS" = "not_installed" ]; then
  npm install -g exceljs 2>/dev/null
fi

# Remotion — MANDATORY for branded visuals (project-local install in Phase 5)
# Pre-check only here; actual install happens in project dir before deliverable generation
if [ "$REMOTION" = "not_installed" ]; then
  echo "REMOTION will be installed in project dir at deliverable generation"
fi

if [ "$LIGHTHOUSE" = "not_installed" ]; then
  npm install -g lighthouse 2>/dev/null
fi

# stryker and pixelmatch are OPTIONAL — project-local install, not global
# They install on-demand in Phase 4/5 if mutation_testing or visual_regression is enabled

# System packages — cross-platform install
if [ "$PANDOC" = "not_installed" ]; then
  if command -v choco >/dev/null 2>&1; then
    choco install pandoc -y 2>/dev/null
  elif command -v brew >/dev/null 2>&1; then
    brew install pandoc 2>/dev/null
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get install -y pandoc 2>/dev/null
  fi
fi

if [ "$D2" = "not_installed" ]; then
  if command -v choco >/dev/null 2>&1; then
    choco install d2 -y 2>/dev/null
  elif command -v brew >/dev/null 2>&1; then
    brew install d2 2>/dev/null
  elif command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://d2lang.com/install.sh | sh -s -- 2>/dev/null
  fi
fi

# graphviz (required by diagrams Python package)
if [ "$GRAPHVIZ" = "not_installed" ]; then
  if command -v choco >/dev/null 2>&1; then
    choco install graphviz -y 2>/dev/null
  elif command -v brew >/dev/null 2>&1; then
    brew install graphviz 2>/dev/null
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get install -y graphviz 2>/dev/null
  fi
fi
```

**After install, re-run detect_tool for each installed tool to confirm success.** Report final status at the end of discovery.

---

## Step 0.1 - Collect Input
Ask user via AskUserQuestion:
- **Paste text** - Meeting transcript, email, chat, or summary
- **File path(s)** - Path to one or more files to read
- **Describe it now** - User types a description interactively

If user provided input as $ARGUMENTS, use directly.

---

## Step 0.2 - Validate Understanding (MANDATORY BEFORE FOLDER CREATION)

**A. Analyze input:** Extract client name, project name, 2-3 sentence summary.

**B. Determine workspace location.**

**CRITICAL DISTINCTION:**
- `PIPELINE_RESOURCES` = where Bridge's templates are installed (READ-ONLY)
- `WORKSPACE` = where client project folders (`clients/`) are created

**Workspace resolution:**
```bash
SAVED_WORKSPACE=$(cat ~/.bridge-workspace 2>/dev/null)
CURRENT_CWD=$(pwd)
```

**REJECT automatically:** Paths containing `Temp`, `tmp`, Bridge installation dir, `~/.claude/`, `node_modules`, `.git`.

| Condition | Action |
|---|---|
| `~/.bridge-workspace` exists AND safe | Use saved path, confirm with user |
| `~/.bridge-workspace` exists but unsafe | Warn, ask for new path |
| No saved workspace AND CWD is safe | FIRST RUN: Ask user explicitly |
| No saved workspace AND CWD is unsafe | MANDATORY: Ask for workspace path |

**C. Present for validation** via AskUserQuestion:
```
=== Before we begin — let me confirm I understood correctly ===

Client: {detected or "unclear — please specify"}
Project: {detected or generated name}

My understanding of the problem:
  {2-3 sentence summary}

Workspace: {RESOLVED_WORKSPACE}
Folder: {WORKSPACE}/clients/{client-slug}/{project-slug}/

Is this correct?
  a) Yes, proceed
  b) Correct client or project name
  c) Your understanding is wrong — let me clarify
  d) Different workspace location
  e) Cancel
```

**NEVER create folders without user confirming (a).**

---

## Step 0.3 - Create or Reuse Client/Project Folder

**Only after user confirmed.**

```bash
ls clients/ 2>/dev/null | grep -i "{client-slug}"
```

**IF CLIENT EXISTS** → Check for existing project. Ask if same or new.
**IF CLIENT DOES NOT EXIST** → Create both:
```bash
mkdir -p clients/{client-slug}/{project-slug}/{input,pipeline,pipeline/lessons,src,tests,docs}
mkdir -p clients/{client-slug}/{project-slug}/deliverables/{proposals,reports,code,data,images,scripts}
```

The `deliverables/` folder uses typed subfolders:
- `proposals/` — Proposal decks, pitch decks (PPTX, DOCX, PDF)
- `reports/` — Technical reports, assessments (HTML, DOCX, PDF)
- `code/` — Built code packages (zip, tar.gz)
- `data/` — Data deliverables (XLSX, CSV, SQL)
- `images/` — ALL generated visual assets (shared across deliverable types)
- `scripts/` — Generation scripts (kept for reproducibility)

Write README.md. Save original input to `input/original-input.md`.

**Initialize Tooling Manifest** (MANDATORY):
Read `modules/tooling-manifest.md` for the template. Create `pipeline/tooling-manifest.md` with the Phase 0 section populated from tool discovery results. This file is updated at every phase transition.

### Step 0.3b - Load Client Knowledge Graph

After creating/reusing client folder, check for existing knowledge:
```bash
ls clients/{client-slug}/.knowledge/graph.json 2>/dev/null
```
If exists: Read `modules/client-knowledge-graph.md` for loading protocol. Inform user: "I have context from {N} previous projects with this client."

**Dream suggestion** (read `modules/dream-consolidation.md` for full protocol):
- If `graph.json` exists AND `last_updated` is > 30 days ago: inform user that knowledge hasn't been consolidated recently and suggest `/bridge dream {client-slug}` after this project completes.
- If client has 3+ completed projects AND no dream has ever run (no `.knowledge/archive/` directory): suggest running dream after this project.

### Step 0.3c - Fast-Track Detection

After understanding the project, evaluate whether it qualifies for the Proposal Fast Track (read `modules/proposal-fast-track.md` for the full protocol).

```
TRIGGER fast-track when ALL are true:
  1. Primary deliverable is a proposal, presentation, or document
     Keywords: "proposal", "deck", "slides", "pptx", "presentation",
              "report", "assessment", "point of view", "one-pager"
  2. No source code build is required
  3. User confirms fast-track mode
```

If fast-track applies, present:
```
I detected this is a deliverable-only project (no code build).

Fast-track mode available:
  - 3 phases instead of 5 (Understand > Generate Assets > Assemble)
  - 4-5 agents instead of 12+
  - Target: 30-45 minutes

  a) Use fast-track (recommended for proposals/decks)
  b) Run full pipeline (I want deep research and architecture phases)
```

If user chooses (a): set `config.pipeline_mode = "fast-track"` and follow `modules/proposal-fast-track.md` instead of the normal phase sequence. Skip Steps 0.4-0.6 and go directly to Phase A.

If user chooses (b): continue with normal Step 0.4.

---

## Step 0.4 - Initialize Configuration

Check if `pipeline/config.json` exists. If not, create with defaults:

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "workflow": {
    "discuss_phase": false,
    "critical_review": true,
    "plan_checker": true,
    "de_sloppify": true,
    "nyquist_validation": false,
    "mutation_testing": false,
    "visual_regression": false,
    "auto_advance": false
  },
  "parallelization": { "enabled": true, "max_concurrent_specialists": 3 },
  "gates": {
    "after_translate": true,
    "after_research": true,
    "after_architecture": true,
    "per_slice": true,
    "after_validation": true
  },
  "security_gate": "blocking",
  "harness_hooks": { "project_hooks": "off", "pipeline_hooks": "off" },
  "budget_cap_usd": null,
  "issue_tracker": { "type": "none" },
  "model_profiles": {
    "quality":  { "architect": "opus", "validator": "opus", "builders": "sonnet", "cleanup": "sonnet" },
    "balanced": { "architect": "opus", "validator": "opus", "builders": "sonnet", "cleanup": "haiku" },
    "budget":   { "architect": "sonnet", "validator": "sonnet", "builders": "sonnet", "cleanup": "haiku" }
  }
}
```

### Project Type Presets (optional shortcut)

The user can say "this is a data pipeline project" or the orchestrator can suggest a preset based on the input analysis. When selected, merge preset overrides into the default config:

| Preset | Granularity | Specialists Hint | Key Overrides |
|---|---|---|---|
| `api-integration` | standard | API connector, data mapper, auth handler | `plan_checker: true`, `de_sloppify: true` |
| `data-pipeline` | standard | ETL builder, data validator, scheduler | `plan_checker: true`, `nyquist_validation: true` |
| `dashboard` | coarse | Frontend builder, data layer, chart components | `plan_checker: false` (simpler scope) |
| `enterprise-feature` | fine | Multiple domain-specific specialists | `discuss_phase: true`, `plan_checker: true`, all gates ON |
| `mvp-rapid` | coarse | 1-2 generalist builders | `plan_checker: false`, `de_sloppify: false`, `per_slice: false` |

Presets are hints, not constraints. The user can customize individual settings after selection.

Present config summary to user:
```
Config: interactive mode | balanced models | plan-checker ON | de-sloppify ON | preset: api-integration
```

### Step 0.4b - Harness Hooks Opt-In (OPTIONAL)

If this is the first run OR `config.harness_hooks.project_hooks` is `"off"`:

Present via AskUserQuestion:
```
Harness Engineering hooks are available. They detect code quality issues,
hardcoded secrets, and dangerous patterns during the build phase.

Options:
a) Enable in WARN mode (recommended) — detect and report, never block
b) Enable in ENFORCE mode — detect and block dangerous patterns
c) Keep OFF (default) — no hooks
```

Update `config.harness_hooks` based on user choice. If user chooses (a) or (b), read `modules/harness-hooks.md` for full configuration details.

**This step is OPTIONAL.** If the user skips it or chooses (c), hooks remain off and the pipeline operates exactly as before.

### Step 0.4c - Install Pipeline Protection Hooks (if user chose warn or enforce)

If user chose (a) or (b) above, install the 3 Pipeline Protection Hooks as real Claude Code hooks in the project's settings. These are NOT advisory instructions — they are deterministic shell hooks that execute automatically.

**Write to `{project-path}/.claude/settings.json`:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const c=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}').command||''; const d=/rm\\s+-rf|git\\s+push\\s+--force|git\\s+reset\\s+--hard|DROP\\s+(TABLE|DATABASE)|kubectl\\s+delete/i; if(d.test(c)){const m='⚠️ Destructive command detected: '+c.match(d)[0]; process.stderr.write(m+'\\n'); process.exit(2)}\""
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const p=i.file_path||i.filePath||''; const proj=process.env.BRIDGE_PROJECT_PATH||''; if(proj && !p.startsWith(proj) && !p.includes('.claude/agents')){process.stderr.write('⚠️ Scope escape: writing outside project dir: '+p+'\\n'); process.exit(2)}\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const s=i.content||i.new_string||''; const d=/AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{20,}|-----BEGIN (PRIVATE|RSA) KEY-----/; if(d.test(s)){process.stderr.write('⚠️ Possible secret detected in output\\n'); process.exit(2)}\""
          }
        ]
      }
    ]
  }
}
```

**Set project path env var** for scope escape detection:
```bash
export BRIDGE_PROJECT_PATH="{absolute-project-path}"
```

These hooks use `exit(2)` which sends feedback to Claude without blocking (warn behavior). For enforce mode, change to `exit(1)` which blocks the tool call.

---

## Step 0.5 - Discuss Phase (OPTIONAL — if config.workflow.discuss_phase)

Before Phase 1, resolve ambiguities in user's input via direct conversation.

Save decisions to `pipeline/00-constraints.md`:
```markdown
# Locked Constraints
| # | Decision | User Said | Locked |
|---|----------|-----------|--------|
| 1 | "Real-time" means... | Within 5 minutes | YES |
```

All downstream agents MUST treat locked constraints as non-negotiable.

---

## Step 0.6 - Initialize Todo List
Create a todo list with TodoWrite tracking all phases.

### Periodic Tool Reminders
- Max 1 reminder per tool across ENTIRE session
- Phase 3 start: mention Excalidraw if missing
- Phase 5 start: mention Greptile if missing
- If user ignores: NEVER mention again
- Tone: casual, never urgent
