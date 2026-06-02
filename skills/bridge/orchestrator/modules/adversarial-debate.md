# Adversarial Debate — Competing Hypotheses Pattern

<!--
  BRIDGE Development Pipeline
  Architecture and orchestration designed by Jose Milton Buitron
  https://github.com/josembuitron/bridge-agentic-pipeline
-->

## Why this module exists

A single reviewer, or a single investigator, tends to find one plausible answer and stop.
Sequential investigation suffers from anchoring: once one theory is on the table, everything
after is biased toward it. The fix Agent Teams demonstrated is a **structured debate** —
several independent workers, each with a distinct or deliberately opposing mandate, that
read and try to disprove each other's positions before a consensus is synthesized. The
theory that survives active refutation is far more likely to be the real one.

BRIDGE's existing Ojo Critico (`references/ojo-critico.md`) is one-directional: a skeptic
critiques an artifact. This module adds the missing dimension — workers challenging *each
other* — which makes Phase 5 validation and hard architectural choices much more robust.

It is ON by default (`config.advanced_orchestration.adversarial_debate.enabled`, default
`true`).

## Why subagents, not native Agent Teams (the deliberate choice)

We implement the debate with plain, independent subagents that communicate **through files**,
not with native Agent Teams. This is not laziness — it is a direct consequence of BRIDGE's
guarantees, each of which native Agent Teams would break:

- **Resumability.** BRIDGE projects run for hours or days across sessions ("continue
  project", `pipeline/state.json`). In-process Agent Teams explicitly do NOT survive
  `/resume` or `/rewind`. File-bridged subagents leave their positions on disk, so a debate
  is fully resumable.
- **Per-client isolation.** Agent Teams store team and task state globally under
  `~/.claude/teams/` and `~/.claude/tasks/`, with no per-project equivalent. BRIDGE isolates
  every client strictly. Subagents writing into `pipeline/` keep the debate inside the
  project's own tree.
- **Per-agent skill routing.** A subagent definition's `skills` and `mcpServers` are NOT
  applied when it runs as a teammate. BRIDGE's whole methodology lives in
  `modules/cross-skill-activation.md`. Subagents preserve per-agent skill routing.
- **Hierarchy.** Teammates cannot spawn teammates (no nested teams). BRIDGE's orchestrator
  spawns specialists that themselves invoke sub-work. Subagents keep that hierarchy intact.
- **Platform.** Split-pane Agent Teams needs tmux or iTerm2 and is unsupported in VS Code's
  integrated terminal and Windows Terminal — this user's stack. In-process mode would work
  but carries the resumability loss above.

So the debate *pattern* is what's valuable; the Agent Teams *feature* is the wrong vehicle
for BRIDGE. We keep the value and drop the incompatibility.

### When native Agent Teams may still be used

`modules/capability-detection.md` resolves `adversarial_debate.engine`. The `agent_teams`
engine is selected ONLY when ALL hold: native teams available, a split-pane mode present,
and the user set `config.advanced_orchestration.agent_teams.prefer_when_available: true`
(default `false`). On the default config and this user's platform, the engine is always
`subagents`. The `agent_teams` branch exists so the value transfers automatically if the
feature matures and the platform constraints lift — without changing BRIDGE's spine.

## The debate protocol (subagents engine)

A debate has three rounds. All exchange happens through files in `pipeline/`, never through
direct inter-agent messaging, which keeps context clean and the whole thing resumable.

1. **Stake positions (parallel).** Spawn N independent subagents (typically 3-5), each with
   a distinct lens or an opposing mandate. Each reads the artifact under scrutiny plus the
   locked constraints and writes its position to
   `pipeline/debate/{topic}/position-{role}.md`: claim, supporting evidence (with file/line
   or source citations), and confidence.
2. **Refute (parallel).** Re-spawn each subagent with read access to the OTHER positions.
   Its job now is adversarial: find the weakest link in each rival position, cite concrete
   evidence, and either concede or hold its ground. Writes
   `pipeline/debate/{topic}/refutation-{role}.md`.
3. **Synthesize (single agent).** A neutral synthesizer reads all positions and refutations
   and writes the consensus: what survived refutation, what was discarded and why, and any
   unresolved disagreement flagged for the human. Writes
   `pipeline/{NN}d-adversarial-debate.md`.

Each subagent gets the `references/prompt-defense-baseline.md` block, the Pixel Agent
description convention (`[Phase N] Debate — {role}`), and reads context by file reference
per `core.md`. Keep prompts under the usual size guard; positions and refutations are short
(a claim plus evidence), not essays.

## Where debate is applied (config: `adversarial_debate.phases`, default `["validate"]`)

- **Phase 5 — validation (default ON).** Run the independent validators as a debate:
  e.g., security vs. performance vs. correctness vs. the adversarial verifier, each
  challenging the others' findings before synthesis. This replaces a quiet, parallel review
  with an active cross-examination and folds into `pipeline/05-validation-report.md`. The
  human approval gate and BLOCKING security gate are unchanged. When Dynamic Workflows is
  available, the rounds can be executed as a workflow (see `modules/workflow-delegation.md`
  and `modules/consolidated-review.md`) to keep the exchange out of the orchestrator's
  context; the protocol is identical.
- **Phase 3 — architecture (opt-in by adding `"architect"` to the phases list).** Before
  locking one architecture, have subagents argue competing approaches (e.g., event-driven
  vs. batch, build vs. buy) and weigh them against each other. This is the "draft a plan
  from several angles before committing" use case. Output:
  `pipeline/03d-adversarial-debate.md`, presented alongside the proposal at the gate.
- **Debugging mode (on demand).** When a root cause is unclear, spawn competing-hypothesis
  subagents that try to disprove each other, converging faster than sequential guessing.

## Team size and task sizing (lessons that transfer)

- Start with **3-5 participants**. Three focused lenses usually beat five scattered ones;
  beyond that, coordination cost rises and returns diminish.
- Give each participant **enough context in its spawn prompt** — the artifact path, the
  specific lens, and the locked constraints. They do not share the orchestrator's history.
- Size each position as a **self-contained deliverable** (a claim plus evidence), not an
  open-ended exploration, so refutation has something concrete to bite on.

## Cost awareness

A debate runs N participants twice (position + refutation) plus a synthesizer, so it costs
meaningfully more than a single review pass. It earns that cost on high-stakes judgments
(final validation, irreversible architecture choices) and is wasteful on routine checks. Log
estimated cost to `pipeline/cost-log.json` per `modules/cost-tracking.md`. If
`adversarial_debate.enabled` is false, Phase 5 falls back to the standard validators plus
Ojo Critico with no debate.

## Fallback and degradation

- If `adversarial_debate.enabled` is false → standard validators + Ojo Critico only.
- If the `agent_teams` engine was requested but capability detection says it is unavailable
  → silently use the `subagents` engine. Never block on a missing engine.
- The synthesized artifact path (`pipeline/{NN}d-adversarial-debate.md`) is the same
  regardless of engine, so the gated pipeline is unchanged.

## Security posture (per references/security-checklist.md change review)

- Subagents read/write only within the current project's `pipeline/debate/` tree — no global
  team state, no cross-client access.
- Every participant carries the prompt-defense baseline and taint protocol; positions cite
  evidence, which makes injected or fabricated claims easier to catch during refutation.
- No new dependency, MCP, or external service. AI-SAFE2 pillar touched: Engineering. The
  Zero Assumptions Rule and the BLOCKING security gate are unaffected.
