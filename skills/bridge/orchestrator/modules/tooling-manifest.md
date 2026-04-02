# Tooling Manifest -- Per-Phase Tool & Agent Tracking

## Purpose

Every BRIDGE project MUST produce a `pipeline/tooling-manifest.md` that documents **exactly** what agent, tools, CLIs, MCPs, plugins, and rendering engines were used at each phase. This is NOT optional -- it is auto-generated and updated at each phase transition.

This document serves three purposes:
1. **Auditability** -- The team knows exactly how the solution was built
2. **Reproducibility** -- A future project for the same client can replicate the toolchain
3. **Learning** -- Feeds the client knowledge graph and global insights

---

## When to Write/Update

| Event | Action |
|-------|--------|
| Phase 0 completes | Create `pipeline/tooling-manifest.md` with tool discovery results |
| Each phase transition | Append phase section with agent + tools used |
| Deliverable generation | Append deliverable section with rendering tools |
| Phase 5 final | Finalize manifest, feed into knowledge graph |

---

## Template

The orchestrator writes and updates this file at each phase boundary:

```markdown
# Tooling Manifest -- {Project Name}

**Generated**: {date}
**Last Updated**: {date}
**Pipeline Version**: BRIDGE v2

---

## Phase 0: Initialization

### Tools Discovered
| Tool | Status | Version | Install Method |
|------|--------|---------|----------------|
| crawl4ai | ready | x.x.x | pip |
| pandoc | ready | x.x | choco |
| pptxgenjs | ready | x.x.x | npm -g |
| exceljs | ready | x.x.x | npm -g |
| remotion | ready | x.x.x | npm (project) |
| diagrams (Python) | ready | x.x.x | pip |
| graphviz | ready | x.x | choco |
| d2 | not_installed | -- | -- |
| semgrep | ready | x.x.x | pip |

### MCP Servers Active
| MCP Server | Status |
|------------|--------|
| Context7 | connected |
| Playwright | connected |
| Excalidraw | connected |
| azure-pricing | connected |
| sequential-thinking | connected |
| memory | connected |
| serena | not_installed |

### Plugins Active
| Plugin | Status |
|--------|--------|
| superpowers | installed |
| pr-review-toolkit | installed |
| code-review | installed |
| Trail of Bits skills | 32 installed |

---

## Phase 1: Translate Requirements

### Agent
| Field | Value |
|-------|-------|
| **Agent Type** | requirements-translator |
| **Model** | opus |
| **Duration** | ~X minutes |

### Tools Used
| Tool | Purpose | Invocations |
|------|---------|-------------|
| sequential-thinking MCP | Structured BRIDGE B-R-I-D reasoning | 1 |
| memory MCP | Store business context | 2 |
| WebSearch | Domain research | 3 |
| ask-questions-if-underspecified (ToB) | Requirement clarification | 1 |

### Skills Activated
| Skill | Purpose |
|-------|---------|
| ask-questions-if-underspecified | Force clarification on ambiguous requirements |

### Output Files
- `pipeline/01-technical-definition.md`
- `pipeline/01a-bridge-analysis.md` (B, R, I, D preliminary)

---

## Phase 2: Research

### Agent
| Field | Value |
|-------|-------|
| **Agent Type** | researcher |
| **Model** | sonnet |
| **Duration** | ~X minutes |

### Tools Used
| Tool | Purpose | Invocations |
|------|---------|-------------|
| crawl4ai CLI | Documentation scraping | X |
| Context7 MCP | Library docs | X |
| Playwright MCP | Interactive doc sites | X |
| WebSearch/WebFetch | Fallback research | X |
| memory MCP | Store findings | X |

### Skills Activated
| Skill | Purpose |
|-------|---------|
| tool-risk-matrix (reference) | Taint tracking + risk classification |
| yara-authoring (if external scripts) | Scan downloads for malicious patterns |

### Output Files
- `pipeline/02-research-report.md`
- `pipeline/01a-bridge-analysis.md` (D-validated section updated)

---

## Phase 3: Architect

### Agent
| Field | Value |
|-------|-------|
| **Agent Type** | solution-architect |
| **Model** | opus |
| **Duration** | ~X minutes |

### Tools Used
| Tool | Purpose | Invocations |
|------|---------|-------------|
| diagrams (Python) | Cloud architecture SVG with vendor icons | X |
| d2 | Non-cloud diagrams | X |
| Remotion | Branded visuals (fallback arch diagrams if others fail) | X |
| Excalidraw MCP | Interactive diagrams | X |
| azure-pricing / aws-pricing MCP | Cost estimation | X |
| uml MCP | C4, BPMN, ERD diagrams | X |
| memory MCP | Architecture decisions | X |
| @panzoom/panzoom (CDN) | SVG zoom/pan in HTML | embedded |

### Skills Activated
| Skill | Purpose |
|-------|---------|
| superpowers:brainstorming | Explore 2-3 architecture approaches |
| superpowers:writing-plans | Structure specialist breakdown |
| entry-point-analyzer (ToB) | Attack surface mapping |
| insecure-defaults (ToB) | Flag insecure defaults |
| audit-context-building (ToB) | Deep architectural context |

### Diagram Generation
| Diagram Type | Tool Used | Output File |
|-------------|-----------|-------------|
| System Architecture | diagrams (Python) | deliverables/images/architecture.svg |
| Data Flow | diagrams (Python) | deliverables/images/data-flow.svg |
| Deployment | D2 | deliverables/images/deployment.svg |
| Mermaid (markdown) | Mermaid | embedded in 03-solution-proposal.md |

### Sub-Agents Spawned
| Agent | Purpose |
|-------|---------|
| effort-estimator | 3-scenario estimation |
| methodology-selector | CT-driven methodology selection |
| plan-checker | 7-dimension plan verification |

### Output Files
- `pipeline/03-solution-proposal.md`
- `pipeline/03d-effort-estimation.md`
- `pipeline/03c-methodology-selection.md`
- `pipeline/03b-plan-check.md`
- `deliverables/images/*.svg`

---

## Phase 4: Build

### Specialists Spawned
| Specialist | Model | Slices | Tools Used |
|-----------|-------|--------|------------|
| spec-backend | sonnet | 3 | Read, Write, Edit, Bash, vitest, eslint, Context7 |
| spec-frontend | sonnet | 2 | Read, Write, Edit, Bash, vitest, eslint, Playwright, lighthouse |
| spec-etl | sonnet | 2 | Read, Write, Edit, Bash, pytest, ruff |

### Skills Activated (embedded in specialist prompts)
| Skill | Applied To |
|-------|-----------|
| superpowers:test-driven-development | ALL code-writing specialists |
| sharp-edges (ToB) | ALL specialists |
| modern-python (ToB) | Python specialists |
| frontend-design | Frontend specialists |

### Per-Slice Security (Shift Left)
| Slice | semgrep Findings | Status |
|-------|-----------------|--------|
| spec-backend/slice-1 | 0 critical, 1 warning | PASS |
| spec-frontend/slice-1 | 0 critical, 0 warning | PASS |

### Output Files
- `pipeline/04-build-manifest.md`
- `src/` (all implementation code)
- `tests/` (all test code)

---

## Phase 5: Validate & Deliver

### Validation Agents
| Agent | Model | Verdict | Duration |
|-------|-------|---------|----------|
| validator | opus | APPROVE | ~X min |
| code-reviewer | sonnet | PASS (3 warnings) | ~X min |
| security-auditor | opus | SECURE | ~X min |
| pr-review-toolkit (6-pass) | mixed | 2 issues found | ~X min |

### Security Tools Used
| Tool | Findings |
|------|----------|
| semgrep SAST | 0 critical, 2 info |
| secrets detection (gitguardian) | 0 secrets |
| npm audit / pip-audit | 0 vulnerabilities |
| fp-check (ToB) | 0 false positives removed |

### Trail of Bits Skills Activated
| Skill | Result |
|-------|--------|
| static-analysis | Clean |
| supply-chain-risk-auditor | No risky deps |
| differential-review | No drift |
| spec-to-code-compliance | Aligned |
| audit-context-building | Context mapped |

### Quality Score
| Metric | Score |
|--------|-------|
| Requirements Coverage | 0.95 |
| Test Pass Rate | 1.00 |
| Security Score | 0.90 |
| Code Quality | 0.85 |
| Documentation | 0.80 |
| **Overall** | **0.91** |

---

## Deliverable Generation

### Rendering Tools Used
| Deliverable | Primary Tool | Secondary Tool | Status |
|-------------|-------------|----------------|--------|
| HTML Report | Native HTML + Chart.js + Mermaid + panzoom | -- | Generated |
| PPTX Presentation | pptxgenjs + **Remotion** (hero slides) | -- | Generated |
| DOCX Proposal | pandoc | -- | Generated |
| XLSX Workbook | exceljs | -- | Generated |
| Architecture SVGs | diagrams (Python) | panzoom (HTML embed) | Generated |
| Hero Slide Image | **Remotion** | -- | Generated |
| Executive Infographic | **Remotion** | -- | Generated |
| Effort Comparison Visual | **Remotion** | -- | Generated |

### Remotion Renders
| Composition | Output | Resolution | Size |
|-------------|--------|------------|------|
| hero-slide | deliverables/images/hero-slide.png | 3840x2160 | ~500KB |
| infographic | deliverables/images/executive-infographic.png | 3840x2160 | ~400KB |
| comparison-table | deliverables/images/effort-comparison.png | 3840x2160 | ~300KB |

---

## Summary

| Category | Count |
|----------|-------|
| Total Agents Spawned | X |
| CLI Tools Used | X |
| MCP Servers Used | X |
| Skills Activated | X |
| Remotion Renders | X |
| Trail of Bits Skills | X |
| Output Files (internal) | X |
| Output Files (client) | X |
```

---

## Orchestrator Protocol

### At Phase Transition

After each phase completes, the orchestrator MUST:

1. Read current `pipeline/tooling-manifest.md`
2. Append the phase section with actual tools/agents used
3. Update counts in Summary section
4. Write updated file

**Implementation**: Use this pattern at each phase gate:

```
After Phase {N} completes:
1. Read pipeline/tooling-manifest.md
2. Append Phase {N} section with:
   - Agent type, model, duration
   - Every tool invoked (CLI, MCP, plugin, rendering engine)
   - Every skill activated
   - Every output file produced
3. Write updated file
```

### At Deliverable Generation

After generating deliverables, append the Deliverable Generation section documenting:
- Which rendering tool produced each deliverable
- Remotion compositions rendered (with resolution and file size)
- Fallbacks used (if primary tool failed)

### Feed to Knowledge Graph

At Phase 5 Step 5.7, when updating the client knowledge graph:

1. Read `pipeline/tooling-manifest.md`
2. Extract tool preferences that emerged:
   - Which diagram tool produced best results
   - Which doc access tool was most reliable
   - Remotion compositions that were generated
3. Add to `clients/{client}/.knowledge/patterns.md`:
   ```markdown
   ## {date} -- {project}: Tooling Patterns
   **Diagram generation**: diagrams Python (primary) -- all 3 SVGs generated successfully
   **Branded visuals**: Remotion -- hero slide + infographic rendered at 2x
   **Doc access**: crawl4ai (primary), Context7 (secondary) -- no fallbacks needed
   **Deliverable formats**: HTML + PPTX + DOCX + XLSX all generated
   ```

### Feed to Global Insights

At Phase 5 Step 5.5b (Karpathy Loop), the evaluation script reads `tooling-manifest.md` to correlate:
- Tool choices → quality scores
- Remotion usage → client satisfaction (if tracked)
- Fallback frequency → tool reliability scores

These feed into `skills/bridge/memory/insights.json` as cross-project patterns.
