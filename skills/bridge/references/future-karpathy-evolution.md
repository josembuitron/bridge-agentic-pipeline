# Future: Karpathy Loop Auto-Evolution

**Status:** Research phase. Do NOT implement yet. This document captures concepts from OpenSpace (HKUDS/OpenSpace) for future evaluation.

**This file is REFERENCE ONLY. The orchestrator should NOT read this file or attempt to execute anything described here.**

---

## Current State (What BRIDGE Has Today)

The Karpathy Loop in `memory/program.md` + `memory/evaluate.ts`:
- Logs key decisions to `ct-decisions.json` (phase, agent, CT framework, confidence, human override)
- Correlates decisions with quality outcomes after each project
- Patterns from 3+ projects become insights in `insights.json`
- Future projects use insights for better methodology selection
- Evolution is MANUAL: the human reviews insights and decides what to change

## What Auto-Evolution Would Add (Inspired by OpenSpace)

OpenSpace (github.com/HKUDS/OpenSpace, MIT license, 2026-03-24) introduces three evolution modes for skills:

### 1. FIX Mode
- **Trigger:** A skill fails 2+ times on similar tasks
- **Action:** Analyze failure patterns, modify the skill to handle the failure case
- **BRIDGE equivalent:** If the Translator fails to extract requirements from a specific input format 2+ times, auto-modify the Translator's prompt to handle that format
- **Risk:** Auto-modified prompts could introduce regressions. Needs version DAG for rollback.

### 2. DERIVED Mode
- **Trigger:** A successful execution reveals a pattern not captured in existing skills
- **Action:** Create a new specialized skill derived from the successful execution
- **BRIDGE equivalent:** After successfully building 3 Azure dashboards, auto-derive a "spec-azure-dashboard" specialist template with proven patterns
- **Risk:** Derived skills could be too specific (overfitting to one client's patterns)

### 3. CAPTURED Mode
- **Trigger:** Post-execution analysis identifies a reusable workflow
- **Action:** Record the workflow as a new skill
- **BRIDGE equivalent:** Capture the exact sequence of CT frameworks that led to the highest quality score and recommend it for similar project types
- **Risk:** Correlation is not causation. A workflow that worked once might not generalize.

## What Would Be Needed to Implement

1. **Skill health metrics:** Track per-skill: applied rate, completion rate, fallback rate, quality score correlation
2. **Failure cascade triggers:** When a tool degrades (e.g., crawl4ai rate-limited), auto-update all skills that depend on it
3. **Version DAG:** Each skill evolution creates a new version. If quality drops, rollback to previous version.
4. **Guardrails:** Max 5 auto-evolution iterations. Human approval required for any evolved skill before it becomes default.
5. **Storage:** SQLite or JSON file for skill version history and metrics

## Evaluation Criteria (When to Revisit)

- Revisit in Q3 2026 (3 months) if OpenSpace reaches 10K+ stars and has 10+ contributors
- Revisit after BRIDGE has completed 10+ projects with Karpathy Loop data to correlate
- Prerequisite: `insights.json` must have confirmed patterns from 3+ projects before auto-evolution makes sense

## Why Not Now

- OpenSpace is 5 days old with 4 contributors. Too immature to depend on.
- BRIDGE has not yet accumulated enough project data for the Karpathy Loop to produce reliable insights. Auto-evolving based on insufficient data would produce garbage.
- The current manual evolution (human reviews insights, decides changes) is safer and sufficient at BRIDGE's current maturity level.
