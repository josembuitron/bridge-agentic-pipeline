# Phase 1: Translate Requirements (BRIDGE B-R-I-D)

Phase 1 performs the business analysis phases of BRIDGE. The Translator focuses on understanding the problem deeply without proposing technical solutions.

## Pre-Phase: Skill Invocations

Before spawning the Translator:
1. `Skill: ask-questions-if-underspecified` (Trail of Bits) → embed in Translator prompt (force clarification of ambiguous requirements instead of assuming)

---

## Step 1.0 - MANDATORY Assumption Elimination Gate (BLOCKING)

**This step is NOT optional. It MUST run before the Translator produces ANY output. The pipeline CANNOT proceed until ALL questions are answered by the user.**

The Orchestrator reads the user's input and identifies every area where an assumption could be made. Then it presents a **structured questionnaire** to the user via AskUserQuestion. The user MUST answer before any analysis begins.

### Why This Exists

This gate exists because Bridge has a proven failure mode: reading artifacts (config files, exports, code) and inferring platform versions, languages, or behaviors that are outdated, deprecated, or wrong. The cost of one wrong assumption propagates through ALL downstream phases and can invalidate the entire build.

**Rule: If Bridge cannot verify a fact from live documentation dated within 6 months, it MUST ask the user.**

### Mandatory Discovery Categories

The Orchestrator MUST ask questions in ALL applicable categories. Not every project needs every category -- skip categories that clearly don't apply (e.g., don't ask about cloud provider for a local CLI tool). But when in doubt, ASK.

#### Category 1: Platform & Version (ALWAYS ask when a platform is involved)

```
Before I begin analysis, I need to confirm some details to avoid wrong assumptions:

PLATFORM & VERSION
1. What exact version of [platform] are you running?
   (e.g., UiPath 2024.10, Salesforce Winter '26, .NET 8, Node 22)
2. Are you on Cloud/SaaS or Self-hosted/On-premises?
3. What license tier? (Community, Pro, Enterprise)
4. Has anything been recently upgraded or is an upgrade planned?
```

#### Category 2: Expression Language & Syntax (ask when building UI/forms/rules)

```
EXPRESSION LANGUAGE & SYNTAX
5. What expression/scripting language does your environment use?
   (e.g., VB legacy vs JavaScript, Power Fx, DAX, SOQL, HCL)
6. Is this the default for new projects, or was it inherited from an older version?
7. Are you building NEW or MODIFYING an existing artifact?
   (New projects may default to a different language than the export we're reading)
```

#### Category 3: Authentication & Access (ask when integrating with APIs/services)

```
AUTHENTICATION & ACCESS
8. What auth method will we use? (OAuth, PAT, API Key, Service Account, SSO)
9. Do you already have credentials configured, or do we need to set them up?
10. Any IP restrictions, VPN requirements, or proxy servers?
11. What permissions/scopes does the service account have?
```

#### Category 4: Environment & Deployment (ask when building something that runs somewhere)

```
ENVIRONMENT & DEPLOYMENT
12. Where will this run? (Cloud service, VM, local machine, container, serverless)
13. Is there a sandbox/dev environment separate from production?
14. Any CI/CD pipeline we should integrate with?
15. Who deploys -- your team, our team, or automated?
```

#### Category 5: Existing Artifacts & Legacy (ask when reference files are provided)

```
EXISTING ARTIFACTS
16. The [export/config/file] you provided -- is this the CURRENT production version
    or an older reference?
17. Are we building ON TOP of this, or REPLACING it?
18. Are there any deprecated features in the current version that we should NOT use
    in the new build?
19. Has anything changed since this file was last exported/saved?
```

#### Category 6: Team & Handoff (ask when someone else will implement/deploy)

```
TEAM & HANDOFF
20. Who will implement the changes we design? (us, your admin, your dev team)
21. What is their skill level with [platform]? (beginner, intermediate, expert)
22. What documentation format do they prefer? (step-by-step, code samples, video)
23. Can they test in a sandbox, or only in production?
```

### How to Present

Use AskUserQuestion with a single consolidated message. Group only the applicable categories. Number every question. Example:

```
=== Before I begin -- I need to eliminate assumptions ===

I've identified 8 areas where making a wrong assumption could break the solution.
Please answer these so I build on facts, not guesses:

PLATFORM & VERSION
1. What exact version of UiPath Studio/Apps are you using?
2. Automation Cloud or self-hosted?

EXPRESSION LANGUAGE
3. UiPath Apps now supports both VB (legacy) and the new expression language.
   Which does your environment use for NEW apps?

EXISTING ARTIFACTS
4. The .uiapp export you gave me -- is this the current production app
   or an older version for reference?
5. Are we modifying this app or building a new one from scratch?

AUTHENTICATION
6. OAuth client credentials or Personal Access Token?
7. Any IP restrictions?

TEAM & HANDOFF
8. Who will paste the widget code into UiPath App Builder?
   What's their comfort level with UiPath Studio?
```

### After Answers

1. **Lock every answer** into `pipeline/00-constraints.md` as a non-negotiable constraint
2. **Flag contradictions** -- if the user's answer contradicts what an artifact says (e.g., user says "new expression language" but export says `expressionLanguage: VB`), resolve it BEFORE proceeding
3. **Propagate to downstream phases** -- add a `## Platform Facts (Locked)` section to the BRIDGE analysis that ALL agents must read

### Re-Validation Triggers

Even after Phase 1 is complete, **any agent in ANY phase** that encounters one of these situations MUST pause and ask the user (via the Orchestrator):

| Trigger | What to Ask |
|---|---|
| Agent reads an artifact and infers a version/language | "The file says X -- is this still current?" |
| Agent finds deprecated API/feature in docs | "This feature is deprecated as of [version]. Are you on a version that still supports it?" |
| Agent's research contradicts a locked constraint | "Research says X, but you told us Y. Which is correct?" |
| Agent assumes a default behavior | "I'm about to assume [behavior]. Can you confirm this is how your environment works?" |

These re-validations are **mandatory, not suggestions**. An agent that assumes instead of asking has FAILED.

### Lesson That Created This Gate

**Rapid Rules Project (2026-03-18):** Bridge read a `.uiapp` export with `expressionLanguage: VB`, built all widget instructions using VB expressions, and delivered to the Admin. The Admin's environment used the NEW expression language (not VB). All APP-RULES.md files were wrong. The Admin had to rebuild everything with a separate Claude instance. Root cause: Bridge assumed the export file reflected the target environment. One question -- "Are you using VB or the new expression language?" -- would have prevented this.

---

## Step 1.1 - Spawn Translator Agent

**CHECKPOINT:** Glob for `pipeline/00-constraints.md`. If it does NOT contain a `## Platform Facts (Locked)` section with answers from Step 1.0, go back to Step 1.0. Do NOT proceed.

Check if `requirements-translator` agent exists via Glob on `agents/requirements-translator.md`.

- If exists: Spawn the `requirements-translator` agent
- If not: Spawn `general-purpose` with translator instructions inline

**Agent description**: `[Phase 1] Requirements Translator -- Analyzing business context with BRIDGE framework`
(On retry: `[Phase 1] Requirements Translator -- Revising analysis with feedback`)

**Context-by-reference** (do NOT paste inline):
```
## Context Files (read these first)
- Original input: {project-path}/input/original-input.md
- Locked constraints: {project-path}/pipeline/00-constraints.md (MUST exist with Platform Facts -- non-negotiable)
- Codebase analysis: {project-path}/pipeline/00b-codebase-analysis.md (if exists -- brownfield)
- Client knowledge: {client-path}/.knowledge/decisions.md (if exists -- prior client context)
- Lessons: {project-path}/pipeline/lessons/*.md (if exist)

## Your Task
Produce TWO outputs:
```

### Output 1: BRIDGE Analysis (`pipeline/01a-bridge-analysis.md`)

**B -- Business Challenge**
- Literal request (quoted/paraphrased)
- Interpreted business challenge
- Success criteria: what does success look like in 90 days?
- Request type: Symptom Request | Solution Request | Cause Request -- reframe toward actual business problem

**R -- Root Causes** (apply Fishbone categorization)
- Structure root causes using Fishbone/Ishikawa categories: **People** (skills, capacity, roles), **Process** (workflows, policies, procedures), **Technology** (systems, tools, integrations), **Data** (quality, availability, formats), **Environment** (market, regulatory, organizational), **Measurement** (metrics, KPIs, monitoring gaps)
- For each category: list confirmed causes (from input) and hypothesized causes (inferred -- flagged for Phase 2 validation)
- Causal chain analysis: trace from symptoms back through categories to root causes

**I -- Impact**
- KPIs off target
- Financial exposure (revenue at risk, cost overruns, opportunity cost)
- Operational friction (manual processes, bottlenecks, error rates)
- Time cost (hours wasted per week/month)

**D -- Data and Context (Preliminary)**
- Data sources mentioned (systems, databases, files, APIs)
- Data gaps identified
- Known technical constraints
- Team capabilities and capacity
- Budget context
- Mark items needing validation: `[NEEDS VALIDATION]`

Leave G and E empty: `[To be completed by the Architect in Phase 3]`

### Output 2: Technical Definition (`pipeline/01-technical-definition.md`)

Read `templates/technical-definition.md` for format. Must include:
- Project name and description
- Business Challenge summary (from BRIDGE B)
- Root causes (from BRIDGE R)
- Impact quantification (from BRIDGE I)
- Business objectives (numbered)
- Functional requirements (numbered, priority: HIGH/MEDIUM/LOW)
- Non-functional requirements
- Systems and integrations (from BRIDGE D, with `[NEEDS VALIDATION]` flags)
- Data sources and destinations
- Success criteria (measurable, tied to BRIDGE I metrics)
- Constraints (budget, timeline, technology, compliance)
- Assumptions and out of scope
- Stakeholders

---

## Step 1.2 - Critical Review (Ojo Critico)

If `config.workflow.critical_review` is true:
1. Spawn Ojo Critico per `core.md` OJO CRITICO section with Phase 1 focus
2. Output: `pipeline/01c-critical-review.md`
3. If BLOCKED: re-run translator with findings. Max 2 loops.

---

## Step 1.3 - HUMAN APPROVAL GATE

**CHECKPOINT:** Glob for `pipeline/01c-critical-review.md`. If missing and `critical_review=true`, go back to Step 1.2.

Present summary of Technical Definition AND critical review findings.

Options via AskUserQuestion:
- **Approve and continue to Research** -- Phase 2
- **Modify** -- User provides corrections (re-run with feedback)
- **Stop here and generate deliverables** -- Read `modules/deliverable-generation.md` for early exit
- **Restart** -- New input

---

## Step 1.4 - Save Output

Write approved Technical Definition to `pipeline/01-technical-definition.md`.
Create pipeline rollback snapshot (read `modules/rollback.md`).
Log cost estimate (read `modules/cost-tracking.md`).
Update TodoWrite.

### Phase Handoff
```markdown
## HANDOFF → Phase 2
- **Status**: COMPLETE
- **Key outputs**: 01-technical-definition.md, 01a-bridge-analysis.md
- **Decisions made**: {key requirements locked}
- **Open questions**: {items marked [NEEDS VALIDATION] for Researcher}
- **Warnings**: {ambiguities, assumptions}
```
