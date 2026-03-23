# BRIDGE Self-Improvement Program

## Purpose
This file defines what the Karpathy Loop evaluates after each project completes. Edit this file to change what BRIDGE learns from.

## Metrics Tracked Per Project
- `quality_score` — from Phase 5 validation (overall + 5 sub-scores)
- `ct_frameworks_used` — which CT frameworks were applied, at which phase
- `methodology_selected` — from Phase 3c selection
- `human_override_rate` — percentage of decisions the user changed at approval gates
- `confidence_vs_outcome` — did agent confidence scores predict final quality?

## Questions Answered After Each Project
1. Which CT framework correlated with highest quality scores?
2. Did Phase 3c methodology selection improve outcomes vs default (FDD)?
3. Where did humans override CT most frequently? Were their overrides correlated with better outcomes?
4. Are any phases consistently underperforming (quality sub-score < 0.7)?
5. Which methodology + project-type combinations produce best results?

## Pattern Thresholds
- **3+ experiments** required before any insight is considered a confirmed pattern
- Insights with confidence < 0.5 are labeled "tentative"
- Insights that contradict each other trigger a manual review flag
- Insights older than 6 months without new evidence are marked "stale"

## Catalog & Confidence Calibration

### catalog.json Update Cadence
The methodology catalog (`ct/methodologies/catalog.json`) should be reviewed when:
- A new methodology emerges in the industry (e.g., new DORA report, new framework publication)
- An insight contradicts a catalog score (e.g., a methodology scored 0.5 consistently produces 0.9+ quality)
- Every 6 months as part of pipeline maintenance

Version the catalog by updating the root-level `last_updated` field. Do NOT delete old methodologies — set `bridge_compatibility` to 0.0 if deprecated.

### Confidence Calibration Curve
Pattern confidence in evaluate.ts uses: `Math.min(evidence_count / 10, 1.0)`

| Experiments | Confidence | Label |
|-------------|-----------|-------|
| 1-2 | 0.1-0.2 | Not enough data |
| 3-4 | 0.3-0.4 | Tentative |
| 5-7 | 0.5-0.7 | Moderate |
| 8-9 | 0.8-0.9 | Strong |
| 10+ | 1.0 | Confirmed |

Phase 3c Methodology Selector should weight insights proportionally to confidence. Tentative insights inform but do not override default selections.

## How Insights Are Used
- **Methodology Selector** reads `insights.json` to inform Six-Hats analysis in Phase 3c
- **Orchestrator** reads insights to adjust default CT framework priority per phase
- If insight says "Lean produces avg score 0.92 for api-integration", selector weights Lean higher for similar projects
- If insight says "SCAMPER at Phase 3 didn't change decisions in 4/5 projects", that CT instruction is flagged for removal in next review
- **Human review**: insights are suggestions, not mandates — human always decides at approval gates
