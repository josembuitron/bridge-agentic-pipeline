# Client Knowledge Graph

## CRITICAL: Per-Client Isolation

Each client has its own `.knowledge/` folder inside their client directory. Agents ONLY read knowledge from the CURRENT client's `.knowledge/` folder. **NEVER access another client's knowledge.**

This is a privacy and data isolation requirement. When this repo becomes public:
- Client data lives in `clients/` (gitignored)
- Knowledge graphs live in `clients/{client}/.knowledge/` (double-gitignored)
- No cross-client data leakage is possible

## Directory Structure

```
clients/
  acme-corp/
    .knowledge/                    ← Knowledge for THIS client only
      graph.json                   ← Structured knowledge graph
      decisions.md                 ← Human-readable decisions log
      patterns.md                  ← What worked well
      anti-patterns.md             ← What did NOT work
    project-alpha/
    project-beta/

  otra-empresa/
    .knowledge/                    ← Totally isolated from acme-corp
      graph.json
      decisions.md
      patterns.md
      anti-patterns.md
    proyecto-uno/
```

## What Gets Stored (automatically after each project)

1. **Technology decisions**: "Client uses Azure, not AWS"
2. **Integration constraints**: "NetSuite REST API rate limit is 10 req/s -- always batch"
3. **Preferences**: "Client prefers TypeScript over JavaScript"
4. **Anti-patterns**: "Power BI service principal auth didn't work -- use master user"
5. **Stakeholder context**: "Data team lead prefers detailed technical docs"
6. **Compliance notes**: "Client requires SOC2 compliance on all cloud resources"
7. **Tooling patterns**: Extracted from `pipeline/tooling-manifest.md` -- which diagram tools, rendering engines, doc access methods worked best for this client

## graph.json Format

```json
{
  "client": "acme-corp",
  "last_updated": "2026-03-21",
  "projects_completed": ["project-alpha", "project-beta"],
  "technology_stack": {
    "cloud": "azure",
    "database": "sql-server",
    "frontend": "react",
    "erp": "netsuite",
    "bi": "power-bi"
  },
  "decisions": [
    {
      "date": "2026-03-01",
      "project": "project-alpha",
      "decision": "Use Azure Data Factory over custom ETL",
      "reason": "Client already has ADF license",
      "category": "technology"
    }
  ],
  "constraints": [
    {
      "constraint": "NetSuite REST API: max 10 req/s, use batch endpoints",
      "source": "project-alpha research phase",
      "severity": "high"
    },
    {
      "constraint": "Azure subscription has no Fabric capacity -- don't propose Fabric",
      "source": "project-alpha architect feedback",
      "severity": "critical"
    }
  ],
  "anti_patterns": [
    {
      "pattern": "Power BI service principal auth doesn't work with client's Azure AD config",
      "discovered": "project-alpha",
      "workaround": "Use master user account with MFA exception"
    }
  ],
  "preferences": {
    "language": "TypeScript",
    "documentation_detail": "high",
    "communication_style": "technical"
  },
  "tooling_patterns": {
    "diagram_tool": "diagrams-python",
    "branded_visuals": "remotion",
    "doc_access": "crawl4ai",
    "deliverable_formats": ["html", "pptx", "docx", "xlsx"],
    "remotion_compositions": ["hero-slide", "infographic", "effort-comparison"],
    "notes": "diagrams Python produced all SVGs successfully. Remotion hero slides well received."
  }
}
```

## When Knowledge Is Read

### Phase 0.2 (after detecting client)
```bash
if [ -f "clients/{client-slug}/.knowledge/graph.json" ]; then
  echo "CLIENT_KNOWLEDGE=available"
fi
```
If exists: "I have context from {N} previous projects with this client."
Read `decisions.md` and `patterns.md` → pass summary to Phase 1 agent.

### Phase 1 (Translator)
Include in agent prompt:
```
## Client History
This is a returning client. Read: clients/{client}/.knowledge/decisions.md
Known technology stack: {from graph.json}
Known constraints: {from graph.json}
Factor these into your requirements analysis.
```

### Phase 2 (Researcher)
Include in agent prompt:
```
## Known Client Constraints
Read: clients/{client}/.knowledge/anti-patterns.md
These are CONFIRMED issues from previous projects. Do NOT recommend approaches
that match these anti-patterns without explicitly addressing the workaround.
```

### Phase 3 (Architect)
Include in agent prompt:
```
## Client Knowledge
Read: clients/{client}/.knowledge/graph.json
Known tech stack: {summary}
Known anti-patterns: {summary}
Your architecture SHOULD align with client's existing technology preferences
unless there is a strong technical reason to diverge (document the reason).
```

## When Knowledge Is Written

### After Phase 5 validation (successful project)
The orchestrator updates the knowledge graph:

1. Read current `graph.json`
2. Add this project to `projects_completed`
3. Add any new technology decisions from `pipeline/03-solution-proposal.md`
4. Add any new constraints discovered in `pipeline/02-research-report.md`
5. Add any anti-patterns from `pipeline/lessons/*.md`
6. **Extract tooling patterns from `pipeline/tooling-manifest.md`** and add to `patterns.md`:
   - Which diagram tool produced results (diagrams Python, D2, Remotion, Excalidraw, Mermaid)
   - Which Remotion compositions were rendered (hero slides, infographics, data viz)
   - Which doc access tools were most reliable
   - Which deliverable formats were generated (HTML, PPTX, DOCX, XLSX)
   - Any tool failures or fallbacks triggered
7. Write updated `graph.json`

### After a failed/rejected approach
If a specialist approach was rejected and fixed, add to `anti-patterns.md`:
```markdown
## {date} -- {project}: {issue title}
**What didn't work:** {approach that failed}
**Why:** {root cause}
**What worked instead:** {solution}
```

## Privacy Rules (CRITICAL)

1. `.knowledge/` directories are in `.gitignore` -- never committed to public repo
2. `clients/` is already gitignored -- double protection
3. The orchestrator NEVER reads `clients/X/.knowledge/` when working on client Y
   - This is enforced by the file path: agents only receive their own client's path
   - The orchestrator MUST NOT compose prompts that reference other clients' paths
4. Knowledge graph data MUST NOT appear in client deliverables (`deliverables/`)
   - Internal pipeline docs (`pipeline/`) may reference it
5. If user asks to "share knowledge between clients" → REFUSE with explanation:
   "Client knowledge is isolated per client for data privacy. Each client's data,
   decisions, and constraints are only accessible within their own projects."

## First-Time Client Setup

When a new client folder is created (Step 0.3) and no `.knowledge/` exists:
```bash
mkdir -p clients/{client-slug}/.knowledge
```

Write initial `graph.json` with just the client name and empty arrays.
Write empty `decisions.md`, `patterns.md`, `anti-patterns.md` with headers.

The knowledge graph grows organically as projects are completed.
