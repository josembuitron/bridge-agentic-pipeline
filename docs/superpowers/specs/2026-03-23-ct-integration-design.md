# Critical Thinking Integration for BRIDGE Pipeline

**Date**: 2026-03-23
**Status**: Approved
**Author**: Jose Milton Buitron

---

## 1. Problem Statement

BRIDGE pipeline agents make decisions at every phase — translating requirements, evaluating technologies, designing architectures, selecting approaches, validating output. These decisions rely on the LLM's general reasoning, supplemented by Ojo Critico (skeptical review) and Plan-Checker (7-dimension validation).

Three gaps exist:

1. **No methodology selection**: Phase 4 always executes Vertical Slices + TDD regardless of project type. A 5-endpoint API doesn't need the same rigor as a 63-REQ enterprise dashboard.
2. **No decision tracking**: Agent decisions and their rationale are lost after each conversation. Human overrides at approval gates are not logged.
3. **No structured learning**: `pipeline/lessons/*.md` captures text-based learnings but cannot correlate decisions with outcomes across projects.

## 2. Scope

### In Scope
- Surgical CT instructions in existing phase files (1-2 lines each)
- Phase 3c: Methodology Selection (new pipeline step)
- Methodology catalog (24 frameworks with metadata)
- Decision logging (`ct-decisions.json`)
- Karpathy Loop: post-project evaluation script (`evaluate.ts`)
- Memory infrastructure (`program.md`, `experiments/`, `insights.json`)

### Out of Scope
- Separate CT TypeScript modules (evaluated and rejected — prompt templates, not computation)
- CT selector script (mapping goes directly in phase files)
- Knowledge Graph / Vector DB (reserved for future if justified by data volume)
- MCP servers for CT (none exist that are production-ready)

## 3. Architecture

### New Files (4)

```
skills/bridge/
├── ct/
│   └── methodologies/
│       └── catalog.json               # 24 frameworks with metadata
└── memory/
    ├── program.md                     # What to evaluate post-project
    ├── evaluate.ts                    # Correlation script (real computation)
    └── insights.json                  # Accumulated patterns (starts empty)
```

### Modified Files (6)

```
skills/bridge/orchestrator/
├── core.md                            # +Phase 3c in pipeline flow
├── phases/
│   ├── 01-translate.md                # +Fishbone for root cause categorization
│   ├── 02-research.md                 # +Force-Field for technology evaluation
│   ├── 03-architect.md                # +Phase 3c step + SCAMPER for alternatives
│   ├── 04-build.md                    # +Read methodology selection, adapt behavior
│   └── 05-validate.md                 # +Decision logging + trigger evaluate
```

### Generated Per Project

```
pipeline/
├── 03c-methodology-selection.md       # Selected methodology + justification
└── ct-decisions.json                  # Audit trail of key decisions
memory/
└── experiments/{date}-{project}.json  # Decision→outcome correlations
```

## 4. Design Details

### 4.1 CT Instructions in Phase Files

Each phase gets 1-3 lines injected at the exact decision point where CT adds value. Not a generic block — surgical placement.

**Phase 1 (01-translate.md)** — After "R — Root Causes":
```markdown
- Structure root causes using Fishbone categories (People, Process, Technology, Data, Environment, Measurement). For each category: list confirmed causes (from input) and hypothesized causes (inferred, flagged for validation).
```
**Why Fishbone here**: BRIDGE R already seeks root causes but doesn't categorize them. Fishbone forces systematic coverage of all cause categories, preventing blind spots (e.g., "Process" causes often missed when input focuses on technology).

**Phase 2 (02-research.md)** — In technology evaluation section:
```markdown
- For each technology decision, apply Force-Field analysis: list driving forces (benefits, strengths, compatibility — scored 1-5) and restraining forces (risks, costs, limitations — scored 1-5). Net score = sum(driving) - sum(restraining). Only recommend technologies with positive net score.
```
**Why Force-Field here**: Researchers tend to rubber-stamp the first viable option. Force-Field forces explicit articulation of downsides alongside benefits, producing genuine comparisons.

**Phase 3 (03-architect.md)** — In "Solution Proposal" section:
```markdown
- Before finalizing architecture, apply SCAMPER to the proposed design:
  - Substitute: What component could be replaced with something simpler?
  - Combine: What components could be merged to reduce complexity?
  - Eliminate: What can be removed without losing core functionality?
  Document the SCAMPER analysis in the proposal. This prevents over-architecture.
```
**Why SCAMPER here**: Architects tend toward additive complexity. SCAMPER's Substitute/Combine/Eliminate forces subtractive thinking, aligned with BRIDGE's YAGNI principle.

**Phase 4 (04-build.md)** — In specialist context:
```markdown
- When encountering a blocking decision with incomplete information, apply Abductive reasoning: list observations, formulate 2-3 hypotheses ordered by plausibility, identify testable predictions, and implement the most plausible hypothesis with a verification step.
```
**Why Abductive here**: Specialists hit ambiguous situations during build. Rather than guessing or stopping, abductive reasoning provides a structured way to proceed under uncertainty.

**Phase 5 (05-validate.md)** — No CT instruction needed. Ojo Critico + Goal-Backward Verification already cover this phase's reasoning needs comprehensively.

### 4.2 Phase 3c: Methodology Selection

**Position in pipeline**: After Step 3.5 (Plan-Checker), before Human Approval Gate (Step 3.3, renumbered to 3.6).

**New pipeline flow**:
```
Phase 3: ARCHITECT
  ├── Step 3.1: Spawn Architect
  ├── Step 3.1b: Diagram images (optional)
  ├── Step 3.2: Critical Review (Ojo Critico)
  ├── Step 3.5: Plan-Checker (if enabled)
  ├── Step 3.6: Methodology Selection (NEW — CT-driven)  ← HERE
  └── Step 3.7: HUMAN APPROVAL GATE (presents methodology + architecture)
```

**How it works**:

The orchestrator spawns a methodology selection subagent with:

```markdown
## Your Role: Methodology Selector
You select the optimal development methodology for this project.

## Context Files (read these)
- Technical Definition: {path}/pipeline/01-technical-definition.md
- Solution Proposal: {path}/pipeline/03-solution-proposal.md
- Methodology Catalog: skills/bridge/ct/methodologies/catalog.json
- Past Insights: skills/bridge/memory/insights.json (if exists)

## Analysis Method: Six Thinking Hats
For the top 5 methodologies (filtered by bridge_compatibility > 0.6):

WHITE (data): How many REQs? How many specialists? What timeline? What complexity?
RED (intuition): What type of project does this feel like? What worked before?
BLACK (risks): What could go wrong with each methodology for THIS project?
YELLOW (benefits): What does each methodology optimize for that THIS project needs?
GREEN (creative): Can 2 methodologies be combined for better fit?
BLUE (process): Which methodology best controls THIS type of project?

Then apply Force-Field on the top 2 candidates.

## Output
Write to: {path}/pipeline/03c-methodology-selection.md

Include:
1. Selected methodology (primary + optional secondary)
2. Six-Hats summary (1-2 sentences per hat)
3. Force-Field scores for top 2
4. Config adjustments (what changes in Phase 4 behavior)
5. Confidence score (0.0-1.0)
```

**Config adjustments that alter Phase 4 behavior**:

| Selected Methodology | config.json Changes |
|---|---|
| FDD + Agentic (default) | No changes — current BRIDGE behavior |
| Lean | `de_sloppify: true`, `garbage_collector: aggressive`, minimize specialist count |
| Kanban flow | `gates.per_slice: false` (approve per specialist, not per slice) |
| RAD | `plan_checker: false`, `critical_review: false` for Phase 3, speed priority |
| Spiral | Add risk-analysis step per slice, prototype iteration before full build |
| XP-style | `mutation_testing: true`, pair specialist review (2nd specialist reviews 1st) |
| DevOps-first | Add CI/CD pipeline as Walking Skeleton Slice 0 |
| Human-in-the-Loop Agentic | `gates.*: true` (all gates enabled, maximum oversight) |
| AgentSecOps | Semgrep scan per slice (already default), add OWASP ZAP if web-facing |
| Context-First | Extend Phase 2 research scope, embed more context per specialist |

These config changes are WRITTEN to `pipeline/config.json` before Phase 4 starts.

### 4.3 catalog.json Structure

```json
{
  "version": "1.0",
  "frameworks": [
    {
      "id": "fdd",
      "name": "Feature-Driven Development",
      "category": "traditional",
      "description": "Organized around delivering client-valued features in 2-week iterations",
      "best_for": ["api-integration", "dashboard", "enterprise-feature"],
      "bridge_compatibility": 0.95,
      "strengths": ["Natural fit with vertical slices", "Feature-focused tracking"],
      "weaknesses": ["Assumes stable team", "Less suited for exploration"],
      "config_adjustments": {},
      "combinable_with": ["agentic-ai", "human-in-the-loop", "lean"]
    }
  ]
}
```

All 24 frameworks included with same structure. Pre-calculated `bridge_compatibility` scores from our analysis.

### 4.4 Decision Logging

**What gets logged**: Key decisions at each phase — not every micro-decision, only choices that could have gone differently.

**How it works**: The orchestrator appends to `pipeline/ct-decisions.json` after each phase completes.

```json
{
  "project": "client-slug/project-slug",
  "decisions": [
    {
      "phase": 1,
      "agent": "requirements-translator",
      "decision": "Identified 3 root causes: process (no ETL validation), technology (legacy API), data (inconsistent formats)",
      "ct_framework_used": "fishbone",
      "alternatives_considered": "Could have focused only on technology cause",
      "confidence": 0.82,
      "human_override": false
    },
    {
      "phase": "3c",
      "agent": "methodology-selector",
      "decision": "Selected FDD + Human-in-the-Loop Agentic",
      "ct_framework_used": "six-hats + force-field",
      "alternatives_considered": "Lean (score: 6.2), Kanban (score: 5.8)",
      "confidence": 0.88,
      "human_override": true,
      "human_choice": "Added Lean principles for waste elimination"
    }
  ]
}
```

**Integration point**: After each phase agent completes and before human approval, the orchestrator writes the decision entry. If the human overrides at the approval gate, the orchestrator updates the entry with `human_override: true` and `human_choice`.

### 4.5 Karpathy Loop (evaluate.ts)

**When it runs**: After Phase 5 completes, as part of the delivery step.

**What it does** (real computation, not LLM prompting):

```typescript
// evaluate.ts — Post-project evaluation
// Runs: node skills/bridge/memory/evaluate.ts <project-path>

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

interface Decision {
  phase: number | string;
  agent: string;
  decision: string;
  ct_framework_used: string;
  confidence: number;
  human_override: boolean;
  human_choice?: string;
}

interface QualityScore {
  overall: number;
  requirements_coverage: number;
  test_pass_rate: number;
  security_score: number;
  code_quality: number;
  documentation: number;
}

interface Experiment {
  date: string;
  project: string;
  methodology_selected: string;
  quality_score: QualityScore;
  decisions: Decision[];
  correlations: Correlation[];
  human_override_rate: number;
  human_was_right_rate: number;
}

interface Correlation {
  ct_framework: string;
  phase: number | string;
  confidence: number;
  outcome_score: number;
  delta: number; // confidence - outcome (positive = overconfident, negative = underconfident)
}

interface Insight {
  pattern: string;
  evidence_count: number;
  first_seen: string;
  last_seen: string;
  recommendation: string;
  confidence: number;
}

function evaluate(projectPath: string): void {
  const basePath = resolve(projectPath);
  const memoryPath = resolve('skills/bridge/memory');

  // 1. Read project artifacts
  const decisions: Decision[] = JSON.parse(
    readFileSync(join(basePath, 'pipeline/ct-decisions.json'), 'utf-8')
  ).decisions;

  const qualityScore: QualityScore = existsSync(join(basePath, 'pipeline/quality-score.json'))
    ? JSON.parse(readFileSync(join(basePath, 'pipeline/quality-score.json'), 'utf-8'))
    : { overall: 0, requirements_coverage: 0, test_pass_rate: 0, security_score: 0, code_quality: 0, documentation: 0 };

  const methodologyFile = join(basePath, 'pipeline/03c-methodology-selection.md');
  const methodology = existsSync(methodologyFile)
    ? readFileSync(methodologyFile, 'utf-8').match(/Selected methodology.*?:\s*(.*)/)?.[1] || 'default'
    : 'default';

  // 2. Calculate correlations
  const correlations: Correlation[] = decisions.map(d => ({
    ct_framework: d.ct_framework_used,
    phase: d.phase,
    confidence: d.confidence,
    outcome_score: qualityScore.overall,
    delta: d.confidence - qualityScore.overall
  }));

  // 3. Calculate human override stats
  const overrideCount = decisions.filter(d => d.human_override).length;
  const humanOverrideRate = decisions.length > 0 ? overrideCount / decisions.length : 0;

  // 4. Build experiment
  const experiment: Experiment = {
    date: new Date().toISOString().split('T')[0],
    project: basePath.split(/[/\\]/).slice(-2).join('/'),
    methodology_selected: methodology,
    quality_score: qualityScore,
    decisions,
    correlations,
    human_override_rate: humanOverrideRate,
    human_was_right_rate: 0 // calculated across experiments
  };

  // 5. Save experiment
  const experimentsDir = join(memoryPath, 'experiments');
  if (!existsSync(experimentsDir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(experimentsDir, { recursive: true });
  }
  const expFile = join(experimentsDir, `${experiment.date}-${experiment.project.replace(/\//g, '-')}.json`);
  writeFileSync(expFile, JSON.stringify(experiment, null, 2));

  // 6. Update insights (pattern detection across 3+ experiments)
  updateInsights(memoryPath, experiment);
}

function updateInsights(memoryPath: string, newExp: Experiment): void {
  const insightsPath = join(memoryPath, 'insights.json');
  const insights: Insight[] = existsSync(insightsPath)
    ? JSON.parse(readFileSync(insightsPath, 'utf-8'))
    : [];

  // Load all experiments
  const expDir = join(memoryPath, 'experiments');
  const expFiles = existsSync(expDir)
    ? require('fs').readdirSync(expDir).filter((f: string) => f.endsWith('.json'))
    : [];

  const allExperiments: Experiment[] = expFiles.map((f: string) =>
    JSON.parse(readFileSync(join(expDir, f), 'utf-8'))
  );

  if (allExperiments.length < 3) {
    writeFileSync(insightsPath, JSON.stringify(insights, null, 2));
    return; // Need 3+ projects for patterns
  }

  // Pattern: CT framework effectiveness per phase
  const frameworkPhaseMap = new Map<string, number[]>();
  for (const exp of allExperiments) {
    for (const corr of exp.correlations) {
      const key = `${corr.ct_framework}@phase-${corr.phase}`;
      if (!frameworkPhaseMap.has(key)) frameworkPhaseMap.set(key, []);
      frameworkPhaseMap.get(key)!.push(corr.outcome_score);
    }
  }

  // Pattern: Methodology effectiveness
  const methodologyScores = new Map<string, number[]>();
  for (const exp of allExperiments) {
    const m = exp.methodology_selected;
    if (!methodologyScores.has(m)) methodologyScores.set(m, []);
    methodologyScores.get(m)!.push(exp.quality_score.overall);
  }

  // Pattern: Human override correlation
  const overrideCorrelation = allExperiments.map(exp => ({
    override_rate: exp.human_override_rate,
    score: exp.quality_score.overall
  }));

  // Generate insights from patterns with 3+ data points
  const newInsights: Insight[] = [];

  for (const [key, scores] of frameworkPhaseMap) {
    if (scores.length >= 3) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const [framework, phase] = key.split('@');
      newInsights.push({
        pattern: `${framework} at ${phase} correlates with avg score ${avg.toFixed(2)}`,
        evidence_count: scores.length,
        first_seen: allExperiments[0].date,
        last_seen: newExp.date,
        recommendation: avg > 0.8 ? `Keep using ${framework} at ${phase}` : `Consider alternatives to ${framework} at ${phase}`,
        confidence: Math.min(scores.length / 10, 1)
      });
    }
  }

  for (const [methodology, scores] of methodologyScores) {
    if (scores.length >= 3) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      newInsights.push({
        pattern: `Methodology "${methodology}" produces avg score ${avg.toFixed(2)}`,
        evidence_count: scores.length,
        first_seen: allExperiments[0].date,
        last_seen: newExp.date,
        recommendation: avg > 0.8 ? `"${methodology}" is effective` : `Reconsider "${methodology}" usage`,
        confidence: Math.min(scores.length / 10, 1)
      });
    }
  }

  writeFileSync(insightsPath, JSON.stringify(newInsights, null, 2));
}

// CLI entry point
const projectPath = process.argv[2];
if (!projectPath) {
  console.error('Usage: node evaluate.ts <project-path>');
  process.exit(1);
}
evaluate(projectPath);
```

### 4.6 program.md

```markdown
# BRIDGE Self-Improvement Program

## Metrics Tracked Per Project
- quality_score (from Phase 5 validation)
- ct_frameworks_used (which ones, at which phase)
- methodology_selected (from Phase 3c)
- human_override_rate (% of decisions user changed)
- confidence_vs_outcome (did agent confidence predict quality?)
- time_per_phase (if available)

## Questions Answered After Each Project
1. Which CT framework correlated with highest quality scores?
2. Did Phase 3c methodology selection improve outcomes vs default?
3. Where did humans override CT most? Were they right?
4. Are any phases consistently underperforming?

## Pattern Thresholds
- 3+ experiments required before any insight is considered a pattern
- Insights with confidence < 0.5 are labeled "tentative"
- Insights that contradict each other trigger manual review flag

## How Insights Are Used
- Methodology Selector reads insights.json to inform Six-Hats analysis
- If insight says "Lean produces avg score 0.92 for api-integration projects",
  selector will weight Lean higher for similar projects
- If insight says "SCAMPER at Phase 3 didn't change decisions in 4/5 projects",
  that CT instruction may be removed in a future review
```

## 5. Integration Points

### 5.1 Phase Gate Enforcement Update (core.md)

Add to Phase 3 → Phase 4 gate check:
```
Phase 3 → Phase 4:
  ✓ pipeline/03-solution-proposal.md
  ✓ pipeline/03c-critical-review.md         (if critical_review=true)
  ✓ pipeline/03b-plan-check.md              (if plan_checker=true)
  ✓ pipeline/03c-methodology-selection.md   (NEW — methodology selected)
```

### 5.2 Decision Logging Integration

The orchestrator appends to `ct-decisions.json` at these moments:
- After Phase 1 agent returns (before Ojo Critico)
- After Phase 2 agent returns (before Ojo Critico)
- After Phase 3 agent returns (before Plan-Checker)
- After Phase 3c methodology selection
- After each Phase 4 specialist slice (key implementation decisions)
- After human override at any approval gate

### 5.3 Post-Delivery Evaluation

After Phase 5 delivery:
```
Phase 5 → Delivery → evaluate.ts → experiment saved → insights updated
```

Orchestrator runs: `node skills/bridge/memory/evaluate.ts <project-path>`

## 6. What This Does NOT Change

- Ojo Critico remains unchanged (no CT overlap)
- Plan-Checker remains unchanged (no CT overlap)
- Goal-Backward Verification remains unchanged
- Quality Score calculation remains unchanged
- Agent prompt size stays within <2,000 token limit
- All human approval gates remain mandatory
- Dual output (internal/client) remains unchanged

## 7. Success Criteria

1. Phase 3c produces a methodology selection that demonstrably differs across project types
2. config.json is modified by methodology selection, visibly changing Phase 4 behavior
3. ct-decisions.json captures decisions with rationale at every phase
4. After 3+ projects, insights.json contains non-trivial patterns
5. Zero increase in agent prompt size beyond 50 tokens per phase
6. No new files created that lack a consumer
