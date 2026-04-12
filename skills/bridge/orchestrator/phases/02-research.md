# Phase 2: Research Technologies

## Anti-Rationalizations (Defensive Prompting)

These are the most common ways an agent rationalizes cutting corners in Phase 2. If you catch yourself thinking any of these, STOP and follow the rebuttal.

| Rationalization | Reality |
|---|---|
| "The official documentation is enough, I don't need community research" | Official docs describe INTENDED behavior. Community research reveals ACTUAL behavior (rate limits lower than advertised, undocumented breaking changes, deprecated features still in docs). The discrepancy escalation protocol exists for this reason. |
| "D-Validation can wait, let me do general research first" | D-Validation is FIRST TASK for a reason. If D-preliminary items are wrong, general research builds on wrong foundations. You will research the wrong API versions, wrong auth methods, wrong data formats. |
| "This technology is well-known, I don't need Force-Field analysis" | Well-known technologies have well-known problems that familiarity masks. Force-Field analysis surfaces the restraining forces (known bugs, scaling limits, licensing traps) that you would otherwise discover in Phase 4. |
| "Taint tracking is overkill for this project" | If the solution consumes ANY external data, taint tracking applies. "Overkill" is the rationalization; data breaches from unsanitized input are the consequence. Even internal APIs can be compromised. |
| "I found one good source, that's enough" | Single-source research is confirmation bias. The Tier 1-6 strategy exists to triangulate. What if that one source is outdated, biased, or wrong? |
| "The Security & Taint Assessment section is optional" | It is MANDATORY. Phase 3 Architect reads it to design security guardrails (Section H of Solution Proposal). Without it, the Architect designs an insecure architecture. |
| "Community intelligence tools are not available, so I'll skip that entire concern" | If agent-reach tools are unavailable, note `[COMMUNITY: not checked]` but STILL search for known issues via WebSearch. The tools are a convenience; the validation mindset is mandatory. |
| "All D-preliminary items confirmed, nothing to correct" | 100% confirmation rate with zero corrections is suspicious. Either D-preliminary was overly conservative, or the Researcher is not looking hard enough. Double-check at least the version numbers and auth methods. |

## Red Flags (Early Deviation Indicators)

Observable signs that Phase 2 is being executed incorrectly. The orchestrator SHOULD check for these before the Human Approval Gate:

- Research report has zero `[DISCREPANCY]` flags (no official-vs-community comparison was done)
- All technologies in Force-Field analysis have only driving forces and zero restraining forces (one-sided analysis)
- Security & Taint Assessment section is missing or contains no entries
- D-Validation section shows 100% `[CONFIRMED]` with zero `[CORRECTED]` items (suspiciously clean)
- Researcher cites only official documentation with zero community sources (blogs, Reddit, GitHub issues)
- Research report recommends technologies not mentioned in the Technical Definition (scope creep)
- Force-Field net scores are all positive with no negative scores anywhere (confirmation bias)
- No `.crawl4ai/` scraped documentation saved for downstream agents
- Tool risk assessment missing for technologies that access external APIs or user data

---

## Step 2.1 - Spawn Researcher Agent

Check if `researcher` agent exists. Spawn accordingly.

**Agent description**: `[Phase 2] Technology Researcher -- Investigating APIs, tools, and integrations`
(On retry: `[Phase 2] Technology Researcher -- Deepening research on {specific area}`)

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Technical Definition: {project-path}/pipeline/01-technical-definition.md
- BRIDGE Analysis: {project-path}/pipeline/01a-bridge-analysis.md (focus on D-preliminary [NEEDS VALIDATION] items)
- Locked constraints: {project-path}/pipeline/00-constraints.md (if exists)
- Codebase analysis: {project-path}/pipeline/00b-codebase-analysis.md (if exists -- brownfield constraints)
- Client knowledge: {client-path}/.knowledge/graph.json (if exists -- known tech stack, anti-patterns)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)
```

### BRIDGE D-Validated (FIRST TASK)

Before general research, validate every `[NEEDS VALIDATION]` item from D-preliminary:
- For each system/API: confirm existence, current API version, auth methods, rate limits, pricing
- For each data source: verify accessibility, format, volume, update frequency
- For each technical constraint: confirm or correct from current docs
- Update `pipeline/01a-bridge-analysis.md` -- add **D -- Data and Context (Validated)** section
- Mark each item: `[CONFIRMED]`, `[CORRECTED: ...]`, or `[NOT AVAILABLE]`
- Flag any hypothesized root causes from BRIDGE R that research confirms or invalidates

### Taint Tracking & Tool Risk Assessment (Harness Engineering)

After D-Validation, assess external content risks for the solution:

1. **Classify taint sources**: For each external system/API the solution will consume data from, note:
   - Data origin (user input, third-party API, public web, file upload, database)
   - Trust level: `TRUSTED` (internal, controlled), `SEMI-TRUSTED` (partner API with SLA), `UNTRUSTED` (user input, public web)
   - Data sensitivity: public, internal, PII, credentials

2. **Map critical sinks**: For each operation the solution will perform with external data:
   - SQL/NoSQL queries, file writes, command execution, HTML rendering, API calls, email/messaging
   - Note which sinks require sanitization and what library/method handles it

3. **Tool risk assessment**: For each recommended technology/tool, classify per `references/tool-risk-matrix.md`:
   - Access type, reversibility, data sensitivity, blast radius
   - Flag HIGH-risk integrations that need architectural guardrails in Phase 3

4. **Add to research report**: Include a **Security & Taint Assessment** section in `pipeline/02-research-report.md`:
   ```markdown
   ## Security & Taint Assessment
   ### External Data Sources
   | Source | Trust Level | Data Sensitivity | Sanitization Available |
   ### Critical Operations (Sinks)
   | Operation | Input Source | Sanitization Method | Library |
   ### Tool Risk Summary
   | Tool/Integration | Risk Level | Guardrails Needed |
   ```

This section informs the Architect's security design in Phase 3. It does NOT block or replace standard research.

### Standard Research (Official Documentation)

Use **documentation access strategy** (read `modules/doc-access-strategy.md`, Tiers 1-6):
1. For each system/integration: Context7 for code libs, crawl4ai for enterprise/API docs, WebSearch as fallback
2. For each capability: research best tools and apply **Force-Field analysis** -- list driving forces (benefits, compatibility, maturity -- scored 1-5) vs restraining forces (risks, cost, complexity -- scored 1-5). Net score = sum(driving) - sum(restraining). Only recommend technologies with positive net score. Include the Force-Field summary in the Recommended Stack section.
3. Save scraped docs to `.crawl4ai/` for other agents
4. Produce Research Report with: API Docs, MCP Servers, Recommended Stack, Best Practices, Risks, Cost/Licensing, Key Findings
5. Map findings back to BRIDGE root causes (R) and impact metrics (I)

### Community Intelligence Research (Real-World Validation)

After official documentation research, cross-check findings against community experience.
Use **Community Intelligence Track** from `modules/doc-access-strategy.md`. Requires agent-reach tools (detected in Phase 0).

If `COMMUNITY_RESEARCH` is `not_available`, skip this step and note `[COMMUNITY: not checked]` in the report.

**For each recommended technology in the stack:**

1. **Reddit reality check**: Search for production experiences, known issues, migration pain
   ```bash
   rdt search "technology_name production issues" --limit 10
   rdt search "technology_name vs alternative" --limit 10
   ```

2. **Exa semantic search**: Find blog posts, case studies, and practitioner insights
   ```bash
   mcporter call 'exa.web_search_exa(query: "technology_name best practices lessons learned", numResults: 5)'
   ```

3. **YouTube deep dives** (for complex integrations): Extract transcripts from conference talks or tutorials
   ```bash
   yt-dlp --dump-json "ytsearch3:technology_name architecture deep dive"
   # Then extract subtitles from the most relevant result
   yt-dlp --write-sub --write-auto-sub --sub-lang "en" --skip-download -o "/tmp/%(id)s" "VIDEO_URL"
   ```

**Add to research report**: Include a **Community Intelligence** section in `pipeline/02-research-report.md`:
```markdown
## Community Intelligence
### Technology Sentiment
| Technology | Official Claim | Community Reality | Source | Risk Flag |
### Workarounds & Gotchas
| Issue | Workaround | Source Thread/Article |
### Adoption Signals
| Technology | Reddit Mentions | Blog Coverage | Trend |
```

**Discrepancy escalation**: If community evidence contradicts official documentation (rate limits lower than advertised, undocumented breaking changes, deprecated features still in docs), mark as `[DISCREPANCY]` and include in Phase Handoff warnings.

---

## Step 2.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico with Phase 2 focus (research review)
2. Output: `pipeline/02c-critical-review.md`
3. If BLOCKED: re-run researcher with findings. Max 2 loops.

---

## Step 2.3 - HUMAN APPROVAL GATE

**CHECKPOINT:** Glob for `pipeline/02c-critical-review.md`. If missing and `critical_review=true`, go back to Step 2.2.

Present Research Report summary AND critical review findings.

Options via AskUserQuestion:
- **Approve and continue to Architecture** -- Phase 3
- **Research more** -- Specify areas for deeper investigation
- **Modify** -- Add preferences or constraints
- **Stop here and generate deliverables** -- Read `modules/deliverable-generation.md`
- **Go back to Requirements** -- Modify Technical Definition

---

## Step 2.4 - Save Output

Write to `pipeline/02-research-report.md`.
Create pipeline rollback snapshot (read `modules/rollback.md`).
Log cost estimate (read `modules/cost-tracking.md`).
Update TodoWrite.

### Phase Handoff
```markdown
## HANDOFF → Phase 3
- **Status**: COMPLETE
- **Key outputs**: 02-research-report.md (includes Security & Taint Assessment + Community Intelligence), updated 01a-bridge-analysis.md (D-validated)
- **Decisions made**: {technology recommendations, API capabilities confirmed}
- **Open questions**: {areas where docs were unclear, pricing needing confirmation}
- **Warnings**: {rate limits, deprecation notices, licensing concerns}
- **Security flags**: {HIGH-risk integrations, taint sources requiring architectural guardrails}
- **Community discrepancies**: {official vs real-world gaps found via community research}
```
