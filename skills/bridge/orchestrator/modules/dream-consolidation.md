# Dream Consolidation Module

A reflective maintenance pass that consolidates, reconciles, and prunes a client's knowledge graph after multiple projects. Inspired by [Piebald-AI's dream memory consolidation](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/agent-prompt-dream-memory-consolidation.md), adapted for BRIDGE's per-client isolation model.

**When to run:**
- Manually via `/bridge dream {client-slug}`
- Suggested by orchestrator when a client has 3+ completed projects
- Suggested at Phase 0.3b when loading a knowledge graph with `last_updated` > 30 days old

**Design rationale:** BRIDGE writes knowledge at Phase 5 completion, but never *revises* it. Over time, knowledge graphs accumulate contradictions, stale entries, and duplication. Dream Consolidation is the garbage collector for client knowledge — it runs between projects, not during them.

---

## Trigger: `/bridge dream {client-slug}`

When the user invokes `/bridge dream`:

1. If `{client-slug}` is provided: run consolidation for that client
2. If no argument: list all clients with knowledge graphs and ask which one to consolidate
3. If `all-tooling`: run the global tooling learnings consolidation only (Level 2 — see below)

```
/bridge dream acme-corp      → Consolidate acme-corp's knowledge
/bridge dream                 → List clients, ask which one
/bridge dream all-tooling     → Consolidate global tooling patterns only
```

**Add to Phase 0 help text:**
```
/bridge dream {client}  ← Consolidate knowledge for a client
```

---

## Level 1: Per-Client Consolidation (PRIMARY)

Spawn a single agent to perform 4 phases. The agent receives ONLY the target client's paths — never another client's data.

### Agent Prompt

**Agent description:** `[Dream] Knowledge Consolidation — {client-slug}`

```markdown
You are performing a dream — a reflective pass over a client's knowledge graph.
Your job is to consolidate, reconcile, and prune what BRIDGE has learned about
this client across all their projects, so future sessions orient faster.

## Client: {client-slug}
## Knowledge directory: {workspace}/clients/{client-slug}/.knowledge/
## Projects directory: {workspace}/clients/{client-slug}/

CRITICAL: You may ONLY read files within clients/{client-slug}/. Do NOT access
any other client's directory. This is a data isolation requirement.

---

### Phase 1 — Orient

1. Read `.knowledge/graph.json` — understand current state
2. Read `.knowledge/decisions.md` — catalog existing decisions
3. Read `.knowledge/patterns.md` — catalog what worked
4. Read `.knowledge/anti-patterns.md` — catalog what failed
5. List all project directories:
   ```bash
   ls -d clients/{client-slug}/*/pipeline/ 2>/dev/null
   ```
6. Note: How many projects? When was graph.json last updated?

### Phase 2 — Gather New Signal

For each completed project, scan for knowledge not yet in the graph:

```bash
# Find all lessons learned
find clients/{client-slug}/*/pipeline/lessons/ -name "*.md" 2>/dev/null

# Find all tooling manifests
find clients/{client-slug}/*/pipeline/tooling-manifest.md 2>/dev/null

# Find all config files (technology choices)
find clients/{client-slug}/*/pipeline/config.json 2>/dev/null

# Find solution proposals (architecture decisions)
find clients/{client-slug}/*/pipeline/03-solution-proposal.md 2>/dev/null

# Find research reports (constraints discovered)
find clients/{client-slug}/*/pipeline/02-research-report.md 2>/dev/null

# Find validation results (quality patterns)
find clients/{client-slug}/*/pipeline/05-validation-report.md 2>/dev/null
```

For each artifact found:
- Read the file
- Extract facts, decisions, constraints, anti-patterns not yet in the knowledge graph
- Note the project and date for each finding

**DO NOT exhaustively read large files.** Use grep for narrow terms:
```bash
grep -n "constraint\|decision\|anti-pattern\|workaround\|failed\|rejected" {file} | head -30
```

### Phase 3 — Consolidate

Update knowledge files with gathered signal. Rules:

#### 3a. graph.json
- Add missing projects to `projects_completed`
- Update `technology_stack` if newer projects introduced new technologies
- Add new `decisions` with date and project attribution
- Add new `constraints` with source and severity
- Add new `anti_patterns` with discovered project and workaround
- Update `tooling_patterns` to reflect most recent/successful tool choices
- Update `last_updated` to today's date
- **Reconcile contradictions**: if project-1 said "use ADF" but project-3 said "use Synapse Pipelines", keep BOTH entries but mark the older one as `"superseded_by": "project-3 decision"`. The most recent decision is the active one.

#### 3b. decisions.md
- Merge duplicate decisions (same choice made in multiple projects → single entry with "Confirmed in: project-1, project-3")
- Convert relative dates to absolute: "last week" → "2026-03-17"
- Remove decisions that were reversed (move to anti-patterns.md instead)
- Group by category: technology, process, compliance, integration

#### 3c. patterns.md
- Merge similar patterns from different projects
- Add quantitative evidence where available: "diagrams Python succeeded in 3/3 projects"
- Remove patterns that were contradicted by later anti-patterns
- Add tooling patterns from tooling manifests

#### 3d. anti-patterns.md
- Deduplicate entries (same issue discovered in multiple projects)
- Verify anti-patterns are still valid: if a later project successfully used the "anti-pattern" approach, it may have been resolved — add a note
- Ensure every anti-pattern has: what failed, why, and what worked instead

### Phase 4 — Prune

1. **graph.json size check**: If `decisions` array > 50 entries, archive old ones:
   - Create `.knowledge/archive/decisions-before-{date}.json`
   - Keep only decisions from the last 10 projects or last 12 months
   - Superseded decisions go to archive

2. **Remove stale entries**:
   - Constraints about API versions that have since been upgraded
   - Technology decisions for tools that no longer exist
   - Anti-patterns for bugs that were fixed upstream

3. **Index coherence**: Ensure graph.json's `projects_completed` matches actual project directories:
   ```bash
   ls -d clients/{client-slug}/*/pipeline/state.json 2>/dev/null
   ```
   If a project directory exists but isn't in `projects_completed`, check if it was actually completed (state.json status = "completed"). If yes, add it.

---

## Output

Return a brief summary of what you consolidated. Format:

```markdown
## Dream Consolidation Report — {client-slug}

**Projects scanned:** {N} ({list})
**Knowledge graph age:** {days since last_updated}

### Changes Made
- **Decisions added:** {N} new, {N} merged, {N} superseded
- **Constraints added:** {N} new, {N} updated, {N} removed (stale)
- **Anti-patterns:** {N} new, {N} deduplicated, {N} marked resolved
- **Patterns:** {N} new, {N} strengthened with evidence
- **Tooling patterns:** {updated fields}

### Contradictions Resolved
- {list of contradictions found and how they were resolved}

### Archived
- {N} old decisions archived to .knowledge/archive/

### No Changes Needed
- {list of areas that were already current}
```

If nothing changed (knowledge is already tight), say so and explain why.
```

---

## Level 2: Global Tooling Learnings (SECONDARY)

Triggered by `/bridge dream all-tooling`. This consolidates **non-client-specific** tooling patterns across ALL clients into a global file. Only tool performance data crosses the client boundary — never business data.

### What crosses the boundary (safe)
- "crawl4ai succeeded in 8/10 projects, failed in 2 (timeout on large SPAs)"
- "diagrams Python produced SVGs in 100% of projects"
- "Remotion hero slides generated in 5/7 projects"
- "D2 was not installed in 6/10 projects — consider removing from recommendations"

### What NEVER crosses (client data)
- Client names, project names, business decisions
- Technology stack choices (these are client-specific)
- Constraints, anti-patterns, preferences

### Output file

Write to: `skills/bridge/orchestrator/modules/tooling-learnings.md`

```markdown
# Tooling Learnings — Cross-Project Patterns

**Last consolidated:** {date}
**Projects analyzed:** {N} across {N} clients

## Tool Reliability
| Tool | Success Rate | Common Failures | Recommendation |
|------|:-----------:|-----------------|----------------|
| crawl4ai | 95% | Timeout on SPAs > 50 pages | PRIMARY — add --wait-for for SPAs |
| diagrams Python | 100% | None | ALWAYS USE for cloud architecture |
| Remotion | 80% | Node memory on large compositions | USE — monitor memory |
| D2 | 30% | Rarely installed | DEMOTE — make optional |
| Excalidraw MCP | 60% | Connection issues | OPTIONAL — good when available |

## Diagram Tool Selection
- Cloud architecture: diagrams Python (100% success)
- Data flow: diagrams Python (preferred) or Mermaid (fallback)
- Sequence diagrams: Mermaid (always available)
- Interactive: Excalidraw MCP (when connected)

## Deliverable Generation
- HTML reports: Native generation (100% reliable)
- PPTX: pptxgenjs + Remotion hero slides (high quality)
- DOCX: pandoc (reliable, ensure pandoc installed)
- XLSX: exceljs (reliable)

## Doc Access Strategy
- Primary: crawl4ai (free, local, reliable)
- Secondary: Context7 MCP (good for library docs)
- Tertiary: Playwright MCP (for interactive sites)
- Last resort: WebSearch/WebFetch (always available)

## Notes
- {date}: {insight from consolidation}
```

### Gathering protocol

```bash
# Scan ALL clients' tooling manifests (reads tool names only, not business content)
for manifest in clients/*/*/pipeline/tooling-manifest.md; do
  echo "=== $manifest ==="
  grep -E "ready|not_installed|connected|Generated|PASS|FAIL" "$manifest" 2>/dev/null
done
```

The agent extracts ONLY tool status lines — never reads full manifests.

---

## Integration Points

### Phase 0.3b — Load Knowledge Graph

Add after existing knowledge graph loading:

```markdown
If graph.json exists AND last_updated is > 30 days ago:
  Inform user: "Knowledge for {client} hasn't been consolidated in {N} days.
  Consider running `/bridge dream {client-slug}` after this project."
```

Do NOT run dream automatically — it's a deliberate action between projects.

### Phase 5.7 — Write Knowledge Graph

After writing knowledge (existing behavior), add:

```markdown
If client now has 3+ completed projects AND no dream has ever run:
  Inform user: "This client now has {N} projects. Running `/bridge dream {client-slug}`
  would consolidate patterns and catch contradictions."
```

### Phase 0 Help Text

Add to the help command output:

```
/bridge dream {client}    ← Consolidate knowledge graph for a client
/bridge dream             ← List clients available for consolidation
/bridge dream all-tooling ← Consolidate global tooling patterns
```

---

## Privacy Rules (inherits from client-knowledge-graph.md)

1. Level 1 agent ONLY receives paths within `clients/{target-client}/`
2. Level 2 agent reads ONLY tool status lines from manifests — never full content
3. Global tooling-learnings.md contains NO client names or business data
4. Dream consolidation reports stay in `.knowledge/` (gitignored)
5. If user asks to "dream across clients" for non-tooling data → REFUSE:
   "Client knowledge is isolated per client. Only tooling patterns (non-business data) can be consolidated globally."

---

## Suggested Cadence

| Trigger | Action |
|---------|--------|
| After 3rd project for a client | Suggest first dream |
| Knowledge graph > 30 days old | Suggest at Phase 0.3b |
| After 10+ projects globally | Suggest `/bridge dream all-tooling` |
| User feels "BRIDGE is suggesting outdated things" | Run dream for that client |

Dream is **never automatic**. It's always user-initiated or user-approved.
