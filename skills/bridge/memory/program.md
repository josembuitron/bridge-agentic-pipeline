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

## How Insights Are Used
- **Methodology Selector** reads `insights.json` to inform Six-Hats analysis in Phase 3c
- **Orchestrator** reads insights to adjust default CT framework priority per phase
- If insight says "Lean produces avg score 0.92 for api-integration", selector weights Lean higher for similar projects
- If insight says "SCAMPER at Phase 3 didn't change decisions in 4/5 projects", that CT instruction is flagged for removal in next review
- **Human review**: insights are suggestions, not mandates — human always decides at approval gates
