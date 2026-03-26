# Proposal Fast Track

When the project deliverable is a document (PPTX, DOCX, PDF proposal) and NOT a software build, collapse the pipeline from 5 phases to 3. This module defines when to trigger fast-track, what each phase does, and how agents are specialized for design quality.

## Detection Logic (Phase 0)

After Step 0.2 (Validate Understanding), the orchestrator evaluates whether fast-track applies:

```
TRIGGER fast-track when ALL of these are true:
  1. Primary deliverable is a proposal, presentation, or document
     Keywords: "proposal", "deck", "slides", "pptx", "presentation", "report",
               "assessment document", "point of view", "one-pager"
  2. No source code build is required
     The user is NOT asking for a working application, API, dashboard, or ETL pipeline
  3. The user confirms fast-track mode at the validation gate

DO NOT trigger when:
  - User wants a working prototype or code
  - Project involves Phase 4 code-writing specialists
  - User explicitly requests full pipeline
```

Present at validation:
```
I detected this is a deliverable-only project (no code build).

Fast-track mode available:
  - 3 phases instead of 5 (Understand > Generate Assets > Assemble)
  - 4-5 agents instead of 12+
  - Target: 30-45 minutes

  a) Use fast-track (recommended for proposals/decks)
  b) Run full pipeline (I want deep research and architecture phases)
```

---

## Phase A: Understand (replaces Phases 1-3)

### Single agent: Content Strategist

**Model**: opus (needs deep reasoning to compress 3 phases into 1)

**Prompt structure:**
```
You are a Content Strategist for a client proposal. Read the input materials
and produce a SINGLE comprehensive document that covers what normally takes 3 pipeline phases.

## Input
- Original input: {input-file-path}
- Client knowledge graph: {knowledge-path} (if exists)
- Brand assets: {brand-config-path} (if exists)

## Produce these sections in ONE document (pipeline/A-content-strategy.md):

### 1. Problem summary
- 3-5 bullet points of the core business challenge
- Quantified pain points (dollar amounts, time wasted, error rates)
- Industry context (what does this client's industry care about?)

### 2. Solution overview
- 6 key capabilities or solution pillars
- For each: one-sentence description + the business value it delivers
- Technology stack recommendation (brief, not exhaustive)

### 3. Architecture sketch
- Mermaid diagram of the solution components
- Key integration points
- Cloud services involved (if applicable)

### 4. Timeline and scope
- 3-4 implementation phases with week estimates
- Deliverable per phase
- Team composition (roles, not individuals)

### 5. Scope options (if applicable)
- MVP vs. Full scope comparison
- What's included / excluded in each

### 6. Deck content outline
- For each proposed slide: title, visual element needed, key message
- Maximum 7 slides (excluding appendix)
- Visual-first: every slide must lead with an image, diagram, or data viz

### 7. Visual asset brief
For each visual needed, specify:
- Asset type: stock photo | Remotion render | editable PPTX shapes | data viz
- Description: exactly what the visual should show
- Search terms: if stock photo, provide 3-5 specific search terms
- Industry relevance: how does this connect to the client's business?
```

**After agent completes:** ONE critical review (Ojo Critico) reviews the content strategy. This is the only critical review in the entire fast-track pipeline.

**Approval gate:**
```
Phase A complete: Content Strategy

{Summary of problem, solution, deck outline}

  a) Approve and generate visuals
  b) Adjust content (provide feedback)
  c) Switch to full pipeline (this needs deeper research)
  d) Stop here and deliver content outline only
```

---

## Phase B: Generate Assets (parallel agents)

Spawn up to 3 agents in parallel. Each produces visual assets.

### Agent B1: Design Director

**Model**: sonnet
**Role**: Orchestrates visual quality. This is the primary design agent.

```
You are a Design Director creating visual assets for a client proposal deck.
You have the eye of a professional designer and the taste of a creative director.

## Your standards:
- Every visual must create a WOW effect worthy of an award-winning design agency
- NEVER produce anything that looks AI-generated (no generic gradients, no abstract dots)
- Think like a human designer: what would make this client say "this is beautiful"?

## Available tools for visuals:
1. Remotion (npx remotion render) -- for branded graphics, UI mockups, data viz, timelines
2. Stock photos via WebSearch + Playwright -- for industry-specific cover imagery
3. PresentationGO templates -- for professional diagram layouts (search by EXACT type)

## Your tasks:

### Task 1: Cover image
Read the content strategy (pipeline/A-content-strategy.md), section 7 (Visual asset brief).

Step 1: Research the client's industry. What visual elements represent this industry?
  - For crypto/gaming: casino chips, neon lights, blockchain nodes, gaming interfaces
  - For healthcare: medical equipment, patient dashboards, clinical settings
  - For finance: trading floors, market charts, corporate buildings
  - Be SPECIFIC to this client, not generic

Step 2: Execute the Image Selection Protocol (see below)

Step 3: Place the winning image in deliverables/images/cover.png (or .jpg)

### Task 2: UI mockups (if the solution has a user interface)
Use Remotion to render React component screenshots showing what the solution looks like.
- Create realistic, industry-appropriate UI designs
- Use the client's brand colors from brand-config.json
- Render at 1920x1080 @2x scale
- Place in deliverables/images/mockup-{n}.png

### Task 3: Supporting visuals
For each remaining visual in the asset brief:
- Stat cards: Remotion composition with large numbers + brand colors
- Timeline: Remotion cascading blocks (NOT horizontal bars)
- Comparison tables: Remotion side-by-side cards
- Icon grids: Search PresentationGO for exact match (e.g., "six icons grid")

## Image Selection Protocol (for cover images and industry visuals)

This protocol runs in under 5 minutes. NEVER spend more than 5 minutes on image selection.

Step 1: Generate ONE image with Remotion using a detailed, industry-specific prompt
  - Include concrete visual elements (objects, scenes, colors specific to the industry)
  - Use brand colors as accent/overlay
  - Render to /tmp/remotion-{slug}/candidate-remotion.png

Step 2: Search for up to 5 stock photos using Playwright browser
  - Use specific search terms from the visual asset brief
  - Navigate to Unsplash, Pexels, or Google Images
  - Browse thumbnails using browser_snapshot (DO NOT download all of them)
  - Select the BEST 2-3 candidates by visual inspection of thumbnails
  - Download only those 2-3 to /tmp/bridge-images/

Step 3: Compare all candidates (Remotion + downloaded stock photos)
  - View each image using Read tool
  - Score each on: industry relevance (0-10), visual quality (0-10), brand fit (0-10)
  - Select the winner
  - Copy winner to deliverables/images/cover.png
  - Delete /tmp/bridge-images/ and /tmp/remotion-{slug}/ after selection

CRITICAL: If a stock photo wins, that's OK. Remotion is NOT always the best tool for
photorealistic imagery. Use the right tool for the job.

## Quality Gate
After generating ALL assets, view each one using Read tool and assess:
- Does this match the brief? (YES/NO)
- Is it industry-relevant? (YES/NO)
- Would a design director approve this? (YES/NO)
If any NO: regenerate with improved prompt (max 1 retry per asset)
```

### Agent B2: Architecture Diagram Builder (if architecture is part of the deck)

**Model**: sonnet

```
You are generating an EDITABLE architecture diagram for a PowerPoint appendix slide.

IMPORTANT: For PPTX output, architecture MUST be native PowerPoint shapes.
DO NOT generate a PNG/SVG image for the architecture slide.

Instead, produce a pptxgenjs script that creates:
- Rounded rectangles for each service/component
- Connecting lines with arrows
- Service labels and icons (using built-in pptxgenjs shapes or icon fonts)
- Color-coded groups (data layer, compute layer, integration layer)

Read the architecture from pipeline/A-content-strategy.md section 3.

Output: scripts/generate-architecture-shapes.js
  - This script exports a function addArchitectureSlide(pptx, slideIndex)
  - The function adds editable shapes directly to the pptxgenjs presentation object

Also generate: deliverables/images/architecture-reference.svg (using diagrams Python or D2)
  - This SVG is the LAYOUT REFERENCE, used by the script author to position shapes
  - It is NOT embedded in the PPTX
```

### Parallel execution
```
Agent B1 (Design Director) ──┐
                              ├── Quality gate: view ALL images before Phase C
Agent B2 (Architecture)    ──┘
```

**Approval gate (slide-by-slide preview):**
```
Phase B complete: Visual Assets Generated

Cover image: [screenshot]
  - Source: {stock photo from Unsplash | Remotion render}
  - Editable in PPTX: No (background image)

UI mockups: [screenshots x3]
  - Source: Remotion React renders
  - Editable in PPTX: No (background images with text overlay)

Architecture: [screenshot]
  - Source: pptxgenjs native shapes script
  - Editable in PPTX: YES (fully editable shapes, lines, text)

Supporting visuals: [list]

  a) Approve all and assemble deck
  b) Regenerate specific asset (specify which)
  c) Replace cover image (I'll provide reference or search terms)
  d) Stop here and deliver raw images only
```

---

## Phase C: Assemble Deck (single agent)

### Agent C1: Presentation Assembler

**Model**: sonnet

```
You are assembling the final PPTX deck from pre-generated visual assets.

Read modules/pptx-engine.md for the full coordinated multi-tool workflow.
Read modules/design-enforcement-hook.md for mechanical rules auto-enforced via hooks.

## Inputs:
- Content strategy: pipeline/A-content-strategy.md
- Cover image: deliverables/images/cover.png
- UI mockups: deliverables/images/mockup-*.png
- Architecture script: scripts/generate-architecture-shapes.js
- Supporting visuals: deliverables/images/*.png
- Brand config: brand-assets/brand-config.json
- Brand template: brand-assets/templates/presentation.pptx (if exists)
- PresentationGO downloads: /tmp/pptx-build-{slug}/presentationgo/ (if any)

## NODE_PATH setup (MANDATORY for all Node.js scripts):
```javascript
// At the top of EVERY generated .js file:
const path = require('path');
process.env.NODE_PATH = process.env.NPM_GLOBAL_PATH ||
  require('child_process').execSync('npm root -g').toString().trim();
require('module').Module._initPaths();
```

## Assembly rules:

### Slide structure (7 slides max + appendix)
Read the deck outline from the content strategy. For each slide:

| # | Slide type | Visual layer | Text layer | Source |
|:-:|---|---|---|---|
| 1 | Cover | Cover image (full bleed) | Title, subtitle, date | Image from B1 |
| 2 | Challenge | 3 stat cards (large numbers) | One summary sentence | Remotion render |
| 3 | Solution | 2x3 icon grid OR feature visual | Feature names + one line | PresentationGO layout |
| 4 | Experience | 2-3 UI mockups side by side | Labels only | Remotion renders |
| 5 | Scope | Two-column comparison | Checkmark items | PresentationGO layout |
| 6 | Timeline | Cascading phase blocks | Phase + weeks + deliverable | Remotion render |
| 7 | Next steps | Numbered action items | 3-4 items with owners | Clean layout |
| A | Appendix: Architecture | EDITABLE pptxgenjs shapes | Service labels | Script from B2 |

### Design rules (ENFORCED, not suggested):
1. NO agenda slides, NO security detail slides, NO open questions slides
2. NO em dashes anywhere (use commas, periods, or colons)
3. Sentence case for all titles (capitalize only first word)
4. NO text walls: if a slide is >40% text by area, redesign with visuals
5. Stat cards with LARGE numbers (48pt+) beat bullet lists every time
6. Cascading/waterfall timelines beat horizontal bar charts
7. Every slide MUST have a dominant visual element
8. Use brand colors from brand-config.json for all shapes and text
9. PresentationGO searches MUST use exact diagram type:
   "four steps process" NOT "modern presentation template"
   "two column comparison" NOT "business layout"
   "statistics cards" NOT "data presentation"

### PPTX Engine (read modules/pptx-engine.md):
- python-pptx is the MASTER builder (opens template, edits, saves final deck)
- pptxgenjs ONLY for editable architecture shapes (appendix slide)
- PresentationGO layouts: recreate positions with brand colors via python-pptx
- Brand template: if exists in brand-assets/templates/, use as base
- QA: run thumbnail.py after generation, view grid before delivering

### Output
- Save to: deliverables/proposals/{project-slug}-proposal.pptx
- Create the proposals/ subfolder if it doesn't exist
```

**Validation pass:**
After assembly, the agent views the generated PPTX metadata (slide count, image references) and confirms:
- Correct number of slides
- All images referenced exist
- No em dashes in any text
- Sentence case titles

---

## Deliverable Folder Structure

Fast-track projects use this structure under `deliverables/`:

```
deliverables/
  proposals/          -- Proposal decks (PPTX, DOCX)
  reports/            -- Technical reports, assessments (HTML, DOCX, PDF)
  code/               -- Built code deliverables (zip, tar.gz)
  data/               -- Data deliverables (XLSX, CSV, SQL)
  images/             -- All generated visual assets (PNG, SVG, JPG)
    cover.png
    mockup-1.png
    mockup-2.png
    architecture-reference.svg
  scripts/            -- Generation scripts (kept for reproducibility)
  README.md           -- Deliverable index
```

The orchestrator creates the appropriate subfolder based on deliverable type:
- Proposals/presentations: `deliverables/proposals/`
- Technical reports: `deliverables/reports/`
- Code packages: `deliverables/code/`
- Data exports: `deliverables/data/`

If the deliverable type changes during the project (e.g., starts as proposal, then adds code), the orchestrator creates additional subfolders without moving existing files.

---

## Metrics

| Metric | Full Pipeline | Fast Track | Improvement |
|---|---|---|---|
| Phases | 5 | 3 | 40% fewer |
| Agents spawned | 12+ | 4-5 | 60% fewer |
| Critical reviews | 3-5 | 1 | 80% fewer |
| Human approval gates | 5+ | 3 | 40% fewer |
| Target wall-clock time | 2-3 hours | 30-45 min | 75% faster |
| Deck versions | 2-3 (average) | 1 | First-time right |

---

## Interaction with Other Modules

| Module | Fast Track behavior |
|---|---|
| `pipeline-state.md` | Uses phases A/B/C instead of 0-5. State file records `"mode": "fast-track"` |
| `tooling-manifest.md` | Still updated at each phase transition (A, B, C) |
| `sanitization-checklist.md` | Applied before writing any client deliverable |
| `brand-assets/` | Used by all visual agents (B1, B2, C1) |
| `client-knowledge-graph.md` | Loaded in Phase A if returning client |
| `dream-consolidation.md` | Runs normally after project completion |
| `context-budget.md` | Less critical (fewer agents, shorter sessions) |
| `rollback.md` | Git tags after Phase A and Phase C approvals |
