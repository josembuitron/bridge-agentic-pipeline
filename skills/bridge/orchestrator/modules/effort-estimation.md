# Effort Estimation — 3 Scenarios

After the Solution Architect completes the architecture (Step 3.1), the orchestrator spawns a dedicated **Effort Estimator Agent** that produces three realistic scenarios comparing human effort, Bridge autonomous effort, and a hybrid approach.

## Why 3 Scenarios

Clients and teams need to make informed decisions about HOW to execute a project, not just WHAT to build. A single timeline is misleading — it hides assumptions about who does the work and at what capacity. Three scenarios expose the trade-offs transparently.

---

## Scenario A: Human-Only Execution

**Purpose:** Traditional project estimate with full role breakdown.

### Estimation Method

For each specialist defined in `03-solution-proposal.md`:

1. **Map specialist → human role(s):**
   | Specialist Pattern | Human Role | Typical Rate Range |
   |-------------------|------------|-------------------|
   | spec-*-backend, spec-*-engineer | Backend Developer | Mid-Senior |
   | spec-*-frontend | Frontend Developer | Mid-Senior |
   | spec-*-integrator | Integration Specialist | Senior |
   | spec-*-data-*, spec-etl-* | Data Engineer | Senior |
   | spec-*-deploy, spec-terraform-* | DevOps/Cloud Engineer | Senior |
   | spec-*-bi-*, spec-power-bi-* | BI Developer | Mid-Senior |
   | spec-*-scientist, spec-ml-* | Data Scientist / ML Engineer | Senior-Lead |
   | spec-*-architect | Solutions Architect | Lead |

2. **Estimate hours per slice:**
   | Slice Type | Hours (Low) | Hours (Mid) | Hours (High) |
   |-----------|-------------|-------------|--------------|
   | Walking Skeleton | 16 | 24 | 40 |
   | Standard feature slice | 24 | 40 | 60 |
   | Complex integration slice | 40 | 60 | 80 |
   | Data pipeline slice | 32 | 48 | 72 |
   | Testing/validation slice | 16 | 24 | 40 |

   Use complexity from BRIDGE "E" evaluation to select Low/Mid/High.

3. **Calculate per-role totals:**
   ```
   Role X total hours = SUM(slices assigned to role × hours per slice)
   ```

4. **Determine dedication and timeline:**
   - For each role, estimate realistic hours/week (NOT 40h — account for meetings, context switching, reviews)
   - Default: 30 productive hours/week for full-time, 15 for half-time
   - Timeline = max(role_hours / weekly_hours) across all sequential dependencies
   - Parallel execution groups reduce calendar time but NOT total hours

### Required Output

```markdown
### Scenario A: Human-Only Execution

#### Team Composition
| Role | Count | Dedication | Hours/Week | Total Hours | Duration |
|------|-------|-----------|------------|-------------|----------|
| Solutions Architect | 1 | 25% | 10h | 40h | 4 weeks |
| Backend Developer | 2 | 100% | 30h/each | 240h | 4 weeks |
| Frontend Developer | 1 | 100% | 30h | 120h | 4 weeks |
| Data Engineer | 1 | 75% | 22h | 144h | 6.5 weeks |
| DevOps Engineer | 1 | 50% | 15h | 60h | 4 weeks |
| QA Engineer | 1 | 50% | 15h | 45h | 3 weeks |

#### Timeline (Gantt-style)
| Phase | Roles Active | Week 1 | Week 2 | Week 3 | ... |
|-------|-------------|--------|--------|--------|-----|
| Foundation | Architect, DevOps | ████ | ██ | | |
| Core Build | Backend ×2, Frontend | | ████ | ████ | ████ |
| Integration | Data Eng, Backend | | | ██ | ████ |
| Validation | QA, All | | | | ██ |

#### Summary
- **Total effort:** {X} person-hours
- **Calendar time:** {Y} weeks
- **Team size:** {Z} people (peak)
- **Assumptions:** [list key assumptions about productivity, availability, skill level]
```

---

## Scenario B: Bridge-Only Execution

**Purpose:** Honest assessment of what BRIDGE can do autonomously, with token and time estimates.

### Assessment Method

1. **For each specialist/slice, evaluate Bridge capability:**

   | Capability Level | Description | Example |
   |-----------------|-------------|---------|
   | **FULL** | Bridge can write, test, and deliver the code completely | Python scripts, API integrations with documented APIs, data transformations, test suites, config files |
   | **GUIDED** | Bridge can write the code but needs human to execute in environments it can't access | Cloud console deployments, proprietary tool configurations, database migrations on prod |
   | **PARTIAL** | Bridge can generate templates/scaffolding but human must customize significantly | Complex UI requiring visual design iteration, ML model tuning with domain expertise |
   | **SUPERVISION** | Bridge can provide instructions/documentation but human does the work | Physical infrastructure setup, vendor negotiations, access provisioning, license procurement |

2. **Estimate tokens per slice:**

   For each slice, calculate:
   ```
   Input tokens = context_files_chars / 4 + prompt_overhead(~2000)
   Output tokens = expected_output_chars / 4 + reasoning_overhead(~1000)
   ```

   **Context file sizing (from solution proposal):**
   - Technical Definition: ~8,000 tokens (typical)
   - Research Report: ~12,000 tokens (typical)
   - Solution Proposal: ~15,000 tokens (typical)
   - Per-slice code generation: varies by complexity

   **Output sizing by slice type:**
   | Slice Type | Avg Output Tokens | Model |
   |-----------|------------------|-------|
   | Walking Skeleton | 8,000-15,000 | Sonnet |
   | Standard feature | 12,000-25,000 | Sonnet |
   | Complex integration | 20,000-40,000 | Opus |
   | Data pipeline | 15,000-30,000 | Sonnet |
   | Architecture/design | 10,000-20,000 | Opus |

3. **Calculate costs using current rates:**

   | Model | Input (per 1M) | Output (per 1M) |
   |-------|---------------|-----------------|
   | Opus (`claude-opus-4-6`) | $15.00 | $75.00 |
   | Sonnet (`claude-sonnet-4-6`) | $3.00 | $15.00 |
   | Haiku (`claude-haiku-4-5-20251001`) | $0.80 | $4.00 |

4. **Estimate time:**
   - Each agent turn: ~30-90 seconds (depending on model and complexity)
   - Each slice: 5-15 turns typical
   - Factor in approval gates: +5 min per gate (human review)
   - Sequential dependencies add calendar time

### Required Output

```markdown
### Scenario B: Bridge-Only Execution

#### Autonomy Assessment
| Specialist | Slice | Capability | What Bridge Does | What Human Does |
|-----------|-------|-----------|-----------------|----------------|
| spec-backend | Walking Skeleton | FULL | Writes all code, tests, config | Reviews & approves |
| spec-backend | API endpoints | FULL | Generates REST API with tests | Reviews & approves |
| spec-frontend | UI components | PARTIAL | Scaffolds components, writes logic | Visual design iteration |
| spec-deploy | Cloud infra | GUIDED | Generates Terraform/IaC | Executes in cloud console |
| spec-data-eng | ETL pipeline | FULL | Writes pipeline code and tests | Reviews & approves |

#### Token & Cost Estimate
| Phase/Agent | Input Tokens | Output Tokens | Model | Est. Cost |
|-------------|-------------|---------------|-------|-----------|
| Translator | ~8K | ~6K | Sonnet | $0.11 |
| Researcher | ~15K | ~12K | Sonnet | $0.23 |
| Architect | ~25K | ~20K | Opus | $1.88 |
| Effort Estimator | ~30K | ~15K | Opus | $1.58 |
| spec-backend (all slices) | ~120K | ~80K | Sonnet | $1.56 |
| spec-frontend (all slices) | ~90K | ~60K | Sonnet | $1.17 |
| spec-deploy | ~40K | ~25K | Sonnet | $0.50 |
| Validator + Security | ~50K | ~30K | Opus | $3.00 |
| **TOTAL** | **~378K** | **~248K** | — | **~$10.03** |

#### Time Estimate
| Phase | Est. Duration | Requires Human |
|-------|--------------|---------------|
| Phases 0-3 (Design) | 15-25 min | Approval gates only |
| Phase 4 (Build) | 45-90 min | Approval per group |
| Phase 5 (Validate) | 10-20 min | Final review |
| **Total pipeline time** | **70-135 min** | **~30 min of human attention** |

#### Feasibility Verdict
- **Can Bridge build this project autonomously?** YES / MOSTLY / PARTIALLY / NO
- **% of slices Bridge can handle fully:** {X}%
- **Blockers for full autonomy:** [list specific things Bridge cannot do]
- **Human supervision hours needed:** {Y}h
```

### CRITICAL: No Hallucination Rule

The estimator MUST NOT:
- Invent capabilities Bridge doesn't have (e.g., "Bridge can deploy to Azure portal")
- Assume access to systems not listed in available tools/MCPs
- Claim precision — all estimates include ±30% range
- Hide limitations — if a slice needs human work, say so explicitly

The estimator MUST:
- Reference actual tools from `modules/available-plugins.md` and `modules/tool-matrix.md`
- Check which MCP servers are actually connected
- Base token estimates on actual file sizes from the solution proposal
- Be conservative — overestimate rather than underestimate

---

## Scenario C: Hybrid Execution (Recommended)

**Purpose:** Optimal split where Bridge handles what it does best and humans handle what requires their expertise.

### Optimization Method

1. **Start from Scenario B autonomy assessment**
2. **For FULL capability slices:** Bridge executes, human reviews (minimal hours)
3. **For GUIDED slices:** Bridge generates code/config, human executes in target environment
4. **For PARTIAL slices:** Bridge scaffolds, human iterates on design/customization
5. **For SUPERVISION slices:** Human executes with Bridge-generated documentation/instructions

### Required Output

```markdown
### Scenario C: Hybrid Execution (Recommended)

#### Work Split
| Specialist | Slice | Executor | Bridge Tokens (In/Out) | Human Hours | Notes |
|-----------|-------|----------|----------------------|-------------|-------|
| spec-backend | Walking Skeleton | Bridge | 30K/20K | 0.5h review | Fully autonomous |
| spec-backend | API endpoints | Bridge | 45K/30K | 1h review | Fully autonomous |
| spec-frontend | UI scaffold | Bridge | 25K/15K | 0h | Scaffold only |
| spec-frontend | Visual polish | Human | 0/0 | 8h | Design iteration |
| spec-deploy | IaC generation | Bridge | 20K/12K | 0h | Code only |
| spec-deploy | Cloud deployment | Human | 0/0 | 4h | Console access |
| spec-data-eng | ETL pipeline | Bridge | 50K/35K | 1h review | Fully autonomous |

#### Bridge Investment
- **Total input tokens:** {X}K
- **Total output tokens:** {Y}K
- **Estimated cost:** ${Z}
- **Bridge execution time:** {T} minutes

#### Human Investment
| Role | Hours | Focus Areas |
|------|-------|------------|
| Tech Lead / Reviewer | 6h | Code reviews, approval gates, architecture decisions |
| Frontend Designer | 8h | Visual design iteration, UX refinement |
| DevOps Engineer | 4h | Cloud console deployments, access provisioning |
| QA Lead | 3h | Acceptance testing, edge case validation |

#### Combined Timeline
| Week | Bridge Activity | Human Activity |
|------|----------------|---------------|
| Day 1 | Phases 0-3 (design) | Review & approve (~1h) |
| Day 1-2 | Phase 4: Backend + Data Eng | Review PRs (~1h) |
| Day 2-3 | Phase 4: Frontend scaffold | Designer iterates on UI (8h) |
| Day 3 | Phase 4: IaC generation | DevOps deploys to cloud (4h) |
| Day 4 | Phase 5: Validation | QA acceptance testing (3h) |

#### Summary Comparison
| Metric | Human-Only | Bridge-Only | Hybrid |
|--------|-----------|-------------|--------|
| Calendar time | {A} weeks | {B} hours | {C} days |
| Total human hours | {D}h | {E}h supervision | {F}h |
| Token cost | $0 | ${G} | ${H} |
| Risk level | Low | Medium | Low-Medium |
| Quality control | Full human review | Automated + gates | Best of both |
```

---

## Integration with Pipeline

### Where It Runs
- **Step 3.3** in Phase 3, after Architect (3.1) and Critical Review (3.2)
- BEFORE Plan Checker (3.5) and Methodology Selection (3.6)
- Output feeds into the Human Approval Gate (3.7)

### What It Reads
- `pipeline/03-solution-proposal.md` — specialists, slices, execution groups
- `pipeline/01a-bridge-analysis.md` — BRIDGE E evaluation (complexity, feasibility)
- `pipeline/02-research-report.md` — technology complexity
- `modules/available-plugins.md` — actual Bridge capabilities
- `modules/tool-matrix.md` — tool availability
- `modules/cost-tracking.md` — token pricing

### What It Writes
- `pipeline/03d-effort-estimation.md` — Full 3-scenario analysis

### How It Appears in Deliverables
- **Internal:** Full detail in `pipeline/03d-effort-estimation.md`
- **Client-facing:** Sanitized version in `deliverables/solution-proposal.md` Section "Implementation Approach & Timeline"
  - Scenario A → "Traditional Team Approach"
  - Scenario C → "Accelerated Approach" (recommended)
  - Scenario B details are INTERNAL ONLY (token costs, Bridge specifics)
  - Client sees timeline comparison and cost implications, not implementation details
