# Discovery Interview Module

Bridge's quality at the end of the pipeline depends almost entirely on the quality of constraints captured before Phase 1 starts. Most reruns and wasted Phase 2/3 cycles trace back to an unstated assumption that should have been locked at the start: the client's actual cloud, an unspoken must-avoid platform, a budget cap that nobody mentioned, a brand the deliverables must match.

ECC has no analog for this. Superpowers `brainstorming` is dialectical and open-ended. The Translator's Assumption Elimination Gate is reactive -- it triggers when the agent hits ambiguity, by which point the translation is already half-written. The Discovery Interview is a structured, categorized, upfront pass that locks the high-leverage constraints into `pipeline/00-constraints.md` before the Translator reads a single line of input.

## When this runs

Phase 0.5 invokes this module on every fresh run. The first thing the user sees is an explicit skip option. Returning users who already know their inputs are tight can skip without any friction.

## Opening prompt (FIRST interaction)

Before asking anything else, the orchestrator presents this choice via AskUserQuestion:

```
Question: I can run a short structured discovery (6 categories, about 3-5 minutes) before Phase 1 starts. It locks key constraints upfront and reduces rework in later phases. Want to do it?

Header: Discovery
Options:
  1. Run full discovery (recommended for new projects and unfamiliar clients) [Recommended]
  2. Run discovery but let me skip any category I want
  3. Skip discovery -- I will rely on the Translator's Assumption Elimination Gate to catch gaps
```

Default if no answer comes back (timeouts, transcript-only mode): option 2 (allow skip per category).

If the user picks option 3, Phase 0.5 ends. Phase 1 starts with no Locked Facts beyond what the Phase 0.2 Validate Understanding step already captured. The Assumption Elimination Gate in Phase 1.0 will still fire on the Translator's first ambiguity.

If the user picks option 1 or 2, the orchestrator proceeds through the 6 categories below. Under option 2, every category opens with a "skip this category" choice; under option 1, only the orchestrator's own judgment can skip a category that is obviously already answered by the original input.

## The 6 categories

Each category is presented as one AskUserQuestion call. Questions inside a category are presented as the option set of that call so the user answers them together. Avoid one-question-per-prompt -- it feels like an interrogation.

### Category 1: Project identity

Locks the slugs, the domain, and the brownfield/greenfield context. This must succeed because the folder structure and the client knowledge graph key off these answers.

Questions to collect:
- Client slug (short, kebab-case)
- Project slug (short, kebab-case)
- Domain / industry vertical
- Brownfield (existing codebase to extend) or greenfield (new from scratch)

### Category 2: Business outcome

Captures the BRIDGE B-R-I-D inputs that the Translator will validate and expand. Pre-locking these reduces the Translator's tendency to invent.

Questions to collect:
- The business challenge in the client's own words (single sentence preferred)
- The visible symptoms (KPIs degraded, processes broken, etc.)
- What "success" looks like, with a measurable definition
- Data sources that must be involved (named, even if details are unclear)

### Category 3: Technical stack

Captures must-use and must-avoid technologies. The Researcher will treat these as hard constraints, not preferences.

Questions to collect:
- Existing stack the solution must integrate with (ERP, BI tool, language, framework)
- Platforms / vendors the client has standardized on (Azure vs AWS vs GCP, SQL Server vs Snowflake, etc.)
- Platforms / vendors that are explicitly off the table (compliance, contracts, prior failures)
- Cloud preference if any, including data residency requirements

### Category 4: Quality posture

Tunes the pipeline's strictness for this project.

Questions to collect:
- Security gate: blocking (CRITICAL findings stop delivery) or advisory (findings logged, user decides)
- Testing rigor: standard (unit + integration), high (add mutation testing), or critical (add property-based + fuzzing)
- Methodology preference if any (Agile, Waterfall, Hybrid, AI-driven), otherwise let Phase 3c select
- Critical review (Ojo Critico) on or off at gates 1, 2, 3

### Category 5: Delivery constraints

Captures the operational box the project lives inside.

Questions to collect:
- Budget cap (USD), or unlimited
- Target timeline / deadline
- Deliverable formats expected (proposal deck, technical report, deployment guide, working code, all of the above)
- Milestone cadence if any (single delivery, biweekly demos, monthly)

### Category 6: Branding

Only relevant if Phase 5 will produce client-facing deliverables. The orchestrator may skip this category in option 1 mode if the original input clearly indicates a code-only project.

Questions to collect:
- Brand assets available (path to brand-config.json or "use defaults")
- Visual tone (formal corporate, modern startup, technical academic)
- Logo and color palette available, or pipeline should use generic neutral palette

## Writing Locked Facts

After each category answers, append a block to `pipeline/00-constraints.md` under `## Locked Facts`:

```markdown
### Discovery -- Category {N}: {Name}
Locked at: {ISO8601 timestamp}
Source: Discovery Interview

| # | Constraint | Value | Notes |
|---|------------|-------|-------|
| {N.1} | {field} | {user value} | {orchestrator note if any} |
```

If a category is skipped, do not write a block for it. The absence of a block is the signal to downstream agents that this category remains under the Assumption Elimination Gate.

## Handoff to Phase 1

When the interview ends (or is skipped), the orchestrator confirms with the user a short recap:

```
Locked from discovery:
- Client: acme / project: data-pipeline-q3
- Stack: Azure, Snowflake, Power BI (must use); AWS (off the table)
- Security: blocking gate; testing: high rigor
- Budget: USD 80,000; deadline 2026-09-30; deliverables: deck + report + code
- Brand: brand-config.json present, formal corporate tone

Proceeding to Phase 1 (Translate).
```

The Translator agent, when it reads `pipeline/00-constraints.md`, treats every Locked Fact as non-negotiable. Any new contradiction the Translator encounters in the input triggers the existing Assumption Elimination Gate.

## Anti-patterns to refuse

- More than 15 questions total. The 6-category structure caps it naturally; do not invent extra questions.
- Asking yes/no questions that the user could not possibly know yet ("Will this need 99.99% uptime?"). If you are tempted to ask one of these, it belongs in Phase 3, not in discovery.
- Pre-filling values the user did not confirm. If the user says nothing about cloud, the cloud field stays empty and downstream agents see "TBD" rather than a fabricated default.
- Skipping the recap. The recap is the user's last chance to correct an interview misunderstanding before the Translator burns tokens on a wrong basis.

## Configuration

The interview is governed by `config.workflow.discovery_interview` (default `true`). To force the legacy free-form discussion (Step 0.5 prior to v2.0.0), set the flag to `false` in `pipeline/config.json` before the run starts. The skip option in the opening prompt is the recommended path for power users; the config flag exists for fully automated runs (CI, batch).
