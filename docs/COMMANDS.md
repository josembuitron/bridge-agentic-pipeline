# BRIDGE Commands

[← Back to README](../README.md)

Every command and configuration knob. The README links here from the commands summary.

---

## Pipeline Commands (Claude Code slash commands)

| Command | What It Does |
|---|---|
| `/bridge` | Start a new project or continue an existing one. The pipeline detects returning projects and offers to resume. |
| `/bridge help` | Show the setup and configuration guide: folder structure, brand assets, tools, phases, and all available commands. |
| `/bridge list` | List all projects across all clients with their current phase and status. |

## Maintenance Commands

| Command | What It Does |
|---|---|
| `/bridge health` | Run 5 diagnostic checks on the most recent active project: state coherence, knowledge freshness, dependency vulnerabilities, test suite health, and documentation drift. |
| `/bridge health {client}/{project}` | Run health checks on a specific project. |
| `/bridge dream {client}` | Consolidate the knowledge graph for a client. Merges decisions, resolves contradictions, prunes stale entries, and archives old data. Recommended after 3+ completed projects. |
| `/bridge dream` | List all clients with knowledge graphs and choose which one to consolidate. |
| `/bridge dream all-tooling` | Consolidate global tooling patterns across all clients. Only tool success rates cross client boundaries -- never business data. |
| `/bridge self-test` | Validate that every file referenced by `core.md` and the phase files actually exists. |

## CLI Commands (Node.js, outside Claude Code)

| Command | What It Does |
|---|---|
| `node scripts/bridge.js doctor` | Check that Node, Python, and the pipeline's CLI tool chain are installed. Exit 0 if all critical present, 1 otherwise. |
| `node scripts/bridge.js status` | Scan `clients/` and print the state of every project (phase, last checkpoint, pending approvals). Add `--markdown` for a markdown table. |
| `node scripts/bridge.js status {client}/{project}` | Status of a single project. |
| `npm test` | Run the structural test suite (required files present + module references resolve). |

After `npm link`, the entry point is also available as `bridge` (e.g. `bridge doctor`).

---

## During Pipeline Execution

At every phase gate, you have these options:

| Option | When to Use |
|---|---|
| **Approve** | Phase output meets your standards. Advance to next phase. |
| **Modify** | Provide specific feedback. The responsible agent re-runs with your corrections. |
| **Stop and deliver** | Accept what exists so far. Deliverables generated from completed phases. |
| **Reject** | Start the phase over. Previous attempt feedback is included to prevent repeating mistakes. |

## Phase 4 Build Options (per slice)

| Option | Effect |
|---|---|
| **Approve and continue** | Accept this slice, move to next. |
| **Approve all remaining** | Skip per-slice review for remaining slices. |
| **Request changes** | Re-run this slice with your feedback. |
| **Skip remaining slices** | Accept thin functionality, move to next specialist. |
| **Review code** | Inspect specific files before deciding. |
| **Pause pipeline** | Save progress and resume later with `/bridge`. |

## Phase 0.5 Discovery Interview options

The interview opens with three choices (see `skills/bridge/orchestrator/modules/discovery-interview.md`):

| Option | Effect |
|---|---|
| **Run full discovery** | Walk all 6 categories. Recommended for new projects or unfamiliar clients. |
| **Allow skip per category** | Walk the interview but offer a "skip this category" option in each one. |
| **Skip discovery entirely** | Phase 0.5 ends immediately; the Translator's Assumption Elimination Gate remains active as a backstop. |

To disable the interview from the configuration entirely (CI / automated runs), set `config.workflow.discovery_interview: false` in `pipeline/config.json` before the run starts.

---

## Configuration (Phase 0)

During initialization, the pipeline asks for configuration preferences. The pipeline writes `pipeline/config.json` in each project folder:

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "workflow": {
    "discovery_interview": true,
    "discuss_phase": false,
    "critical_review": true,
    "plan_checker": true,
    "de_sloppify": true,
    "mutation_testing": false,
    "visual_regression": false,
    "auto_advance": false
  },
  "parallelization": { "enabled": true, "max_concurrent_specialists": 3 },
  "security_gate": "blocking",
  "budget_cap_usd": null,
  "gates": {
    "after_translate": true,
    "after_research": true,
    "after_architecture": true,
    "per_slice": true,
    "after_validation": true
  }
}
```

| Setting | Options | Default | Effect |
|---|---|---|---|
| `mode` | `interactive` / `yolo` | `interactive` | Approval gates at every phase vs auto-advance |
| `granularity` | `coarse` / `standard` / `fine` | `standard` | Fewer slices (faster) vs more slices (thorough) |
| `model_profile` | `quality` / `balanced` / `budget` | `balanced` | Opus everywhere vs mixed vs Sonnet everywhere |
| `workflow.discovery_interview` | `true` / `false` | `true` | Run structured pre-translator interview in Phase 0.5 |
| `workflow.critical_review` | `true` / `false` | `true` | Run Ojo Critico (with rubric scoring) at gates |
| `security_gate` | `blocking` / `advisory` | `blocking` | Critical findings block delivery vs log only |
| `budget_cap_usd` | number / `null` | `null` | Cost cap with 80% warning and 100% pause |

## Project Type Presets

| Preset | Granularity | Key Flags |
|---|---|---|
| `api-integration` | standard | plan-checker ON, de-sloppify ON |
| `data-pipeline` | standard | plan-checker ON, security-gate blocking |
| `dashboard` | coarse | plan-checker OFF (simpler scope) |
| `enterprise-feature` | fine | discovery interview ON, all gates ON |
| `mvp-rapid` | coarse | plan-checker OFF, de-sloppify OFF, per-slice gates OFF |

## Brand Assets

Place your brand guidelines in `brand-assets/` to customize all deliverable output:

```json
{
  "company": "Your Company",
  "colors": { "primary": "#003366", "secondary": "#0066CC", "accent": "#FF6600" },
  "fonts": { "heading": "Georgia, serif", "body": "Calibri, sans-serif" },
  "logo_path": "logo.png"
}
```

Add branded `.pptx` and `.docx` templates to `brand-assets/templates/`. If no brand assets exist, the pipeline creates defaults on first run.
