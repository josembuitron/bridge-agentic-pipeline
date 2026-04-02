# Deliverable Generation

## FAST-TRACK DETECTION

Before running the full deliverable pipeline, check if fast-track mode applies. Read `modules/proposal-fast-track.md` for the complete protocol.

```
If project is deliverable-only (proposal, deck, document, assessment) AND no code build:
  -> Use fast-track (3 phases, 4-5 agents, 30-45 min target)
  -> The rest of this module still applies for design rules and folder structure

If project has code build:
  -> Use full pipeline (this module's normal flow)
```

---

## DELIVERABLE FOLDER STRUCTURE

All deliverables go in typed subfolders under `deliverables/`:

```
deliverables/
  proposals/          -- Proposal decks, pitch decks (PPTX, DOCX, PDF)
  reports/            -- Technical reports, assessments (HTML, DOCX, PDF)
  code/               -- Built code packages (zip, tar.gz)
  data/               -- Data deliverables (XLSX, CSV, SQL)
  images/             -- ALL generated visual assets (PNG, SVG, JPG)
  scripts/            -- Generation scripts (kept for reproducibility)
  README.md           -- Deliverable index with table of contents
```

The orchestrator creates the appropriate subfolder based on deliverable type detected in Phase 0:
- Proposals/presentations: `deliverables/proposals/`
- Technical reports: `deliverables/reports/`
- Code packages: `deliverables/code/`
- Data exports: `deliverables/data/`

If additional deliverable types emerge during the project, create new subfolders without moving existing files.

---

## TWO OUTPUT TRACKS

### 1. Internal Output (`pipeline/`)
Full pipeline details for the development team. Includes everything: agent names, skill details, orchestration notes.

### 2. Client Output (`deliverables/`)
Professional, client-facing documents. Read `modules/sanitization-checklist.md` before writing ANY client deliverable.

---

## EARLY EXIT DELIVERABLE GENERATION

When user chooses "Stop here and generate deliverables" at ANY phase:

### Step E.1 - Determine Completed Phases
Check which `pipeline/` files exist (01 through 05).

### Step E.2 - Generate Internal Summary
Write `pipeline/internal-summary.md`: phases completed, phases skipped, agent utilization, metadata.

### Step E.3 - Generate Client Deliverables (by last completed phase)

**After Phase 1 (Requirements):**
Write `deliverables/requirements-document.md`:
- Professional Requirements Document
- Project overview, objectives, scope
- Functional and non-functional requirements
- Systems and integrations identified
- Success criteria and constraints
- Next steps: "We recommend proceeding with a technology assessment"

**After Phase 2 (Research):**
Write `deliverables/technology-assessment.md`:
- Everything from Requirements PLUS technology landscape, recommended stack, risk assessment, cost analysis
- Next steps: "We recommend proceeding with solution architecture design"

**After Phase 3 (Architecture) -- MOST COMMON:**
Write `deliverables/solution-proposal.md`:
- Executive Summary
- Business Objectives and Requirements Summary
- Solution Architecture (SVG diagrams with cloud icons from `deliverables/images/`; Mermaid as fallback)
- "Implementation Team and Approach" (NOT "Required Specialists")
- Technology Stack and Justification
- Data Flow and Integration Design
- Deployment and Testing Strategy
- **Implementation Approach & Timeline (3 Scenarios)** -- Sanitized from `pipeline/03d-effort-estimation.md`:
  - "Traditional Team Approach" (Scenario A: roles, hours, timeline -- full detail)
  - "Accelerated Approach" (Scenario C hybrid: combined timeline, team + automation)
  - Scenario B (Bridge-only) is INTERNAL ONLY -- do NOT include token costs or Bridge specifics in client deliverables
  - Present comparison table with calendar time, team size, and relative cost
- Risk Mitigation, Cost Considerations
- Next steps: "Upon approval, our team can proceed with implementation"

Also write `deliverables/architecture-diagrams.md`: all Mermaid diagrams, sanitized.

**During Phase 4 (Build - partial):**
Write `deliverables/progress-report.md`:
- Everything from Proposal PLUS implementation progress, remaining work, updated timeline

**After Phase 5 (Full completion):**
Full deliverable set (see below).

### Step E.4 - ALWAYS Generate
Write `deliverables/README.md`: title, date, table of contents, document descriptions.

### Step E.5 - Sanitization
Read and apply `modules/sanitization-checklist.md` before writing ANY client deliverable.

### Step E.6 - Present Exit Summary
```
=== Pipeline Stopped After Phase {N}: {Phase Name} ===

Internal artifacts: pipeline/
Client deliverables: deliverables/

Client-Ready: deliverables/{document-name}.md ← Share with client
Internal: pipeline/*.md ← Full technical details for team
```

### Step E.7 - Rich Format Deliverables (OPTIONAL)

#### Interactive HTML Report (ALWAYS generate)
Write `deliverables/{project-slug}-report.html`:
- Single-file HTML with embedded CSS/JS
- CDN links for Chart.js, Mermaid, DataTables, **@panzoom/panzoom@4.5.1**
- Tabbed navigation: Executive Summary | Architecture | Requirements | Timeline | **Effort Estimation** | Costs
- **Architecture diagrams**: Read `modules/architecture-diagrams.md` for the full strategy:
  - If SVG files exist in `deliverables/images/` (from `diagrams` Python or D2): inline them with panzoom containers (zoom/pan enabled, control buttons for +/−/reset)
  - If Excalidraw URLs exist: embed as interactive iframes
  - Fallback: render Mermaid via CDN (no zoom)
  - NEVER render architecture as tiny non-zoomable boxes. All diagrams MUST be interactive.
- **Effort Estimation tab**: Comparison table from `pipeline/03d-effort-estimation.md` (client-safe: Scenarios A and C only, no token details)
- Brand colors from `brand-assets/brand-config.json` if available
- Print-to-PDF friendly, dark/light mode toggle

#### Word Document (if pandoc available)
```bash
pandoc deliverables/solution-proposal.md --reference-doc="brand-assets/templates/report.docx" \
  -o deliverables/solution-proposal.docx
```

#### PowerPoint (Coordinated Multi-Tool Generation)

**Read `modules/pptx-engine.md` for the full coordinated workflow.** The PPTX engine coordinates python-pptx, pptxgenjs, Remotion, PresentationGO, and html2pptx.

**Key principle**: python-pptx is the MASTER builder. Other tools produce INPUTS that python-pptx integrates into the final deck.

**Design rules are mechanically enforced via hooks.** Read `modules/design-enforcement-hook.md` for deterministic checks (em dashes, local installs, NODE_PATH, PresentationGO search quality).

Before generating PPTX, the deliverable generator MUST:

1. **Read `modules/pptx-engine.md`** and follow the decision tree:
   - Brand template exists in `brand-assets/templates/`? → Strategy A (highest quality)
   - PresentationGO has matching layouts for slide types? → Strategy B
   - Neither available? → Strategy C (from scratch)

2. **Check tool availability from Phase 0 variables** (NOT by re-running detection):
   - `REMOTION`, `NPM_GLOBAL_PATH` from Phase 0
   - python-pptx availability (pip)
   - NEVER re-run installations

3. **Render visual assets FIRST** (Remotion in /tmp/, NOT client folder)

4. **Assemble deck** following the selected strategy from pptx-engine.md

5. **QA with thumbnail.py** before delivery (agent views slide grid)

6. **Save to typed subfolder**: `deliverables/proposals/{slug}-proposal.pptx`

### Proposal Deck Design Rules (ENFORCED)

These rules are NOT suggestions. Agents MUST follow them. Violation = rejection at approval gate.

**Structure:**
- Maximum 7 slides for proposals (excluding appendix)
- NEVER include: agenda slides, security detail slides, open questions slides, "about us" slides
- Architecture goes in APPENDIX as editable PowerPoint shapes, NOT in main flow

**Visual-first design:**
- Every slide MUST lead with a visual (image, diagram, mockup, data viz, or stat cards)
- If a slide is >40% text by area, it MUST be redesigned
- Stat cards with LARGE numbers (48pt+ font) create more impact than bullet lists
- Cascading/waterfall timeline blocks are more visual than horizontal bar charts
- UI mockups (Remotion-rendered) replace text descriptions of interfaces

**Text rules:**
- NO em dashes anywhere (use commas, periods, or colons instead)
- Sentence case for all titles (capitalize only first word and proper nouns)
- No marketing jargon ("leverage", "synergy", "holistic", "ecosystem")
- One key message per slide, not a wall of bullets

**PresentationGO usage:**
- Search by EXACT diagram type needed, not generic categories:
  - "four steps process" NOT "modern business template"
  - "two column comparison" NOT "professional layout"
  - "statistics cards" NOT "data presentation"
  - "six icons grid" NOT "feature showcase"
- Download 1-2 templates per slide type, not bulk generic packs
- Map each slide need to a specific search query BEFORE searching

### Slide Type Template

| # | Slide | Visual element | Text element | Visual source |
|:-:|---|---|---|---|
| 1 | Cover | Industry photo or Remotion branded graphic (full bleed) | Title, subtitle, date | Image Selection Protocol |
| 2 | Challenge | 3 stat cards with large numbers | One summary sentence | Remotion composition |
| 3 | Solution | 2x3 icon grid or feature visual | Feature name + one line each | PresentationGO "information blocks" |
| 4 | Experience | 2-3 UI mockup screenshots side by side | Labels only | Remotion React renders |
| 5 | Scope | Two-column comparison | Checkmark items per column | PresentationGO "two column comparison" |
| 6 | Timeline | Cascading phase blocks | Phase name + weeks + deliverable | Remotion or PresentationGO "steps process" |
| 7 | Next steps | Numbered list with connecting line | 3-4 action items with owners | Clean pptxgenjs layout |
| A | Architecture (appendix) | EDITABLE pptxgenjs shapes (rounded rects, lines, arrows) | Service labels | pptxgenjs native, NOT image |

### Slide-by-Slide Preview Gate (OPTIONAL)

For proposal decks, the orchestrator MAY present a slide-by-slide preview at the Phase B/C gate:
```
Slide 1 (Cover): [screenshot or description]
  Visual: {stock photo | Remotion render} -- Editable: No (background)
Slide 2 (Challenge): [stat card layout]
  Visual: Remotion stat cards -- Editable: Yes (numbers + text)
...

  a) Approve all slides
  b) Regenerate slide {N} (provide feedback)
  c) Replace image on slide {N}
```

This gate is recommended when the project is high-stakes or the user has expressed design preferences.

#### Excel Workbook (if exceljs available)
Requirements matrix, cost model, timeline data.

**Fallback:** If pptxgenjs or exceljs missing, skip that format silently. Remotion failure does NOT block PPTX -- it degrades to plain slides.

---

## Tooling Manifest Update (MANDATORY at deliverable generation)

After generating deliverables, the orchestrator MUST update `pipeline/tooling-manifest.md` with the Deliverable Generation section. Read `modules/tooling-manifest.md` for the template. Document every rendering tool used for each deliverable.

---

## FULL DELIVERABLE GENERATION (Phase 5 completion)

Spawn subagents for deliverable generation (fresh context each):
- `[Phase 6] Report Generator -- Creating client-facing technical report`
- `[Phase 6] Proposal Generator -- Creating executive summary`
- `[Phase 6] Presentation Generator -- Creating slide deck with Remotion visuals`

**CRITICAL: The Presentation Generator MUST read `modules/remotion-renderer.md` and render branded visuals BEFORE generating PPTX.**

### Client Deliverables (`deliverables/`)

**1. Client Report** (`client-report.md`)
- Executive Summary (non-technical, 2-3 paragraphs)
- Business Objectives Addressed
- Solution Overview (NO agent references)
- Architecture (Mermaid diagrams)
- Technology Stack table
- Implementation Summary (team effort language)
- Testing and QA Summary
- Deployment Instructions
- Recommendations and Next Steps
- Appendix (requirements traceability matrix)

**2. Architecture Documentation** (`architecture-diagrams.md`)
- System architecture, data flow, component interaction, integration points
- ALL sanitized

**2b. Architecture Images** (`images/`) -- SVG files from `diagrams` (Python), D2, or Excalidraw. See `modules/architecture-diagrams.md`.

**3. Deployment Guide** (`deployment-guide.md`)
- Prerequisites, step-by-step deployment, configuration, monitoring, rollback

**4. API Reference** (`api-reference.md`) -- if applicable

**5. Deliverables README** (`README.md`)

### Internal Artifacts
All `pipeline/` files remain as-is with full agent details.

### Project README
Overview with pointers to both `deliverables/` (client) and `pipeline/` (team).

---

## Brand Assets

On first run, if `brand-assets/` doesn't exist, create with README explaining:
- `brand-config.json` -- colors, fonts, logo
- `templates/presentation.pptx` -- branded PowerPoint template
- `templates/report.docx` -- branded Word template
- `templates/report.css` -- CSS overrides for HTML reports
