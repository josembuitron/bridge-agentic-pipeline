# Deliverable Generation

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

**After Phase 3 (Architecture) — MOST COMMON:**
Write `deliverables/solution-proposal.md`:
- Executive Summary
- Business Objectives and Requirements Summary
- Solution Architecture (Mermaid diagrams)
- "Implementation Team and Approach" (NOT "Required Specialists")
- Technology Stack and Justification
- Data Flow and Integration Design
- Deployment and Testing Strategy
- Timeline (execution groups → project phases)
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
- CDN links for Chart.js, Mermaid, DataTables
- Tabbed navigation: Executive Summary | Architecture | Requirements | Timeline | Costs
- Brand colors from `brand-assets/brand-config.json` if available
- Print-to-PDF friendly, dark/light mode toggle

#### Word Document (if pandoc available)
```bash
pandoc deliverables/solution-proposal.md --reference-doc="brand-assets/templates/report.docx" \
  -o deliverables/solution-proposal.docx
```

#### PowerPoint (if pptxgenjs available)
Generate and run `deliverables/generate-pptx.js`.

#### Excel Workbook (if exceljs available)
Requirements matrix, cost model, timeline data.

**Fallback:** If any tool missing, skip that format silently.

---

## FULL DELIVERABLE GENERATION (Phase 5 completion)

Spawn subagents for deliverable generation (fresh context each):
- `[Phase 6] Report Generator — Creating client-facing technical report`
- `[Phase 6] Proposal Generator — Creating executive summary`
- `[Phase 6] Presentation Generator — Creating slide deck`

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

**2b. Architecture Images** (`images/`) — if Excalidraw was available

**3. Deployment Guide** (`deployment-guide.md`)
- Prerequisites, step-by-step deployment, configuration, monitoring, rollback

**4. API Reference** (`api-reference.md`) — if applicable

**5. Deliverables README** (`README.md`)

### Internal Artifacts
All `pipeline/` files remain as-is with full agent details.

### Project README
Overview with pointers to both `deliverables/` (client) and `pipeline/` (team).

---

## Brand Assets

On first run, if `brand-assets/` doesn't exist, create with README explaining:
- `brand-config.json` — colors, fonts, logo
- `templates/presentation.pptx` — branded PowerPoint template
- `templates/report.docx` — branded Word template
- `templates/report.css` — CSS overrides for HTML reports
