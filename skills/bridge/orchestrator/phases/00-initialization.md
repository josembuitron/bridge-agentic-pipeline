# Phase 0: Initialization

## Step 0.HELP - Help & Configuration Guide (if user asks for help)

If the user invokes the skill with "help", "setup", "configure", or asks "how do I set this up?", present this guide instead of running the pipeline:

```
=== BRIDGE Pipeline — Setup & Configuration Guide ===

📁 FOLDER STRUCTURE
The pipeline organizes work in your workspace directory:

  {WORKSPACE}/
  ├── projects/clients/{client}/{project}/   ← Project deliverables
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

```bash
# 1. crawl4ai CLI (free, local)
crwl --version 2>/dev/null && echo "CRAWL4AI=ready" || echo "CRAWL4AI=not_installed"

# 2. Context Hub CLI
npx @aisuite/chub --help 2>/dev/null && echo "CONTEXTHUB=available" || echo "CONTEXTHUB=unavailable"

# 3. Playwright MCP — check for mcp__plugin_playwright_playwright__browser_navigate
# 4. Context7 MCP — check for mcp__plugin_context7_context7__resolve-library-id
# 5. Greptile MCP
if [ -n "$GREPTILE_API_KEY" ]; then echo "GREPTILE=available"; else echo "GREPTILE=needs_api_key"; fi

# 6. Excalidraw MCP — check for mcp__excalidraw__create_from_mermaid
# 7. WebSearch/WebFetch — ALWAYS AVAILABLE

# 8. Deliverable generation tools
which pandoc >/dev/null 2>&1 && echo "PANDOC=ready" || echo "PANDOC=not_installed"
node -e "require('pptxgenjs')" 2>/dev/null && echo "PPTXGENJS=ready" || echo "PPTXGENJS=not_installed"
node -e "require('exceljs')" 2>/dev/null && echo "EXCELJS=ready" || echo "EXCELJS=not_installed"

# 9. Remotion (MANDATORY for branded visuals & hero slides)
node -e "require('remotion')" 2>/dev/null && echo "REMOTION=ready" || echo "REMOTION=not_installed"

# 10. Architecture diagram tools
python -c "import diagrams" 2>/dev/null && echo "DIAGRAMS=ready" || echo "DIAGRAMS=not_installed"
which d2 2>/dev/null && echo "D2=ready" || echo "D2=not_installed"
```

### Tool Auth Requirements

| Tool | Needs API Key? | Impact if Missing |
|------|:-:|---|
| **crawl4ai** | No | HIGH — primary doc access |
| **Context Hub** | No | LOW |
| **Context7/Playwright** | No | LOW/MEDIUM |
| **Greptile** | **YES** | LOW — enhancement only |
| **Excalidraw MCP** | No | LOW — Mermaid stays as markdown |
| **WebSearch/WebFetch** | No | N/A — always available |

**Present results in a friendly, non-blocking way.** Show ✅ for available, list optional missing with plain-language explanations. **NEVER block the pipeline on optional tools.**

**Fallback chain**: crawl4ai → Playwright → Context Hub → Context7 → WebSearch/WebFetch → training knowledge (flag as unverified)

**Store session variables:**
```
AVAILABLE_DOC_TOOLS: [list of confirmed tools]
PREFERRED_WEB_METHOD: crawl4ai (if installed) | playwright | websearch
FALLBACK_CHAIN: crawl4ai → playwright → context-hub → context7 → websearch → training-knowledge
```

**Pass AVAILABLE_DOC_TOOLS to EVERY agent prompt:**
```
## Available Documentation Tools
Confirmed available AND authenticated: {AVAILABLE_DOC_TOOLS}
Preferred method: {PREFERRED_WEB_METHOD}
Fallback chain: {FALLBACK_CHAIN}
If preferred tool denied, try next in chain. If ALL fail, use training knowledge and mark "⚠️ UNVERIFIED"
```

### Step 0.0c - Smart Plugin Check

Read `modules/available-plugins.md` for the full reference table of all plugins, MCP servers, and CLI tools.

```bash
claude plugins list 2>/dev/null | grep "❯" | awk '{print $2}' | sort
```

Compare against Bridge's recommended plugin list (in `modules/available-plugins.md`). Only show gaps. If all CRITICAL and HIGH priority plugins are present: `Plugins: all recommended ✅` and move on.

**Auto-install CLI tools if missing** (present plan first, run all installs in single Bash):
```bash
pip install -U crawl4ai 2>/dev/null && crawl4ai-setup 2>/dev/null
npm install -g @aisuite/chub 2>/dev/null
which pandoc >/dev/null 2>&1 || pip install pandoc 2>/dev/null
npm list -g pptxgenjs >/dev/null 2>&1 || npm install -g pptxgenjs 2>/dev/null
npm list -g exceljs >/dev/null 2>&1 || npm install -g exceljs 2>/dev/null

# Remotion — MANDATORY for branded visuals (project-local install in Phase 5)
# Pre-check only here; actual install happens in project dir before deliverable generation
node -e "require('remotion')" 2>/dev/null || echo "REMOTION will be installed in project dir at deliverable generation"

# Architecture diagram tools
pip install diagrams 2>/dev/null
choco install graphviz -y 2>/dev/null || apt-get install -y graphviz 2>/dev/null || brew install graphviz 2>/dev/null
```

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
mkdir -p clients/{client-slug}/{project-slug}/{input,pipeline,pipeline/lessons,src,tests,docs,deliverables,deliverables/images}
```

Write README.md. Save original input to `input/original-input.md`.

**Initialize Tooling Manifest** (MANDATORY):
Read `modules/tooling-manifest.md` for the template. Create `pipeline/tooling-manifest.md` with the Phase 0 section populated from tool discovery results. This file is updated at every phase transition.

### Step 0.3b - Load Client Knowledge Graph

After creating/reusing client folder, check for existing knowledge:
```bash
ls clients/{client-slug}/.knowledge/graph.json 2>/dev/null
```
If exists: Read `modules/client-knowledge-graph.md` for loading protocol. Inform user: "I have context from {N} previous projects with this client."

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
