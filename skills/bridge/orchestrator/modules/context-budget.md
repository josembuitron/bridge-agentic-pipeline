# Context Budget Protocol

Prevents context window degradation across multi-phase pipelines.

## Rule 1: Never Accumulate — Always File-Bridge

After each phase, the orchestrator:
1. WRITES the output to `pipeline/` (already standard)
2. Does NOT keep the full output in conversation memory
3. When the next phase needs it, the AGENT reads it from disk
4. The orchestrator only keeps a **3-5 line SUMMARY** per phase

## Rule 2: Phase Handoff via Disk, Not Context

- Phase 1 output → write to `01-technical-definition.md` → pass FILE PATH to Phase 2 agent
- Phase 2 output → write to `02-research-report.md` → pass FILE PATH to Phase 3 agent
- NEVER pass "here is the full research report" inline in the agent prompt
- Instead: `"Read clients/{c}/{p}/pipeline/02-research-report.md for context"`

## Rule 3: Specialist Prompts Are Self-Contained

Each specialist agent prompt includes:
- Its specific task (from solution proposal) — ~200 tokens
- File paths to read (not inline content) — ~100 tokens
- The specialist's own .md definition — ~500 tokens
- Methodology instructions (TDD, security) — ~500 tokens
- **Total prompt target: <2,000 tokens per specialist**

The agent reads 50-100K tokens of context from disk using its own fresh 200K window.

## Rule 4: Orchestrator Checkpoint Summaries

After each phase approval, the orchestrator writes a checkpoint in its conversation:

```
Phase {N} complete. Summary: {3-5 lines}.
Full output: pipeline/{NN}-{name}.md
Key decisions: {bullet list}
Next: Phase {N+1}
```

This checkpoint is what stays in the orchestrator's context — NOT the full output.

## Rule 5: Large Project Detection

If Phase 3 produces >5 specialists or >20 files in the manifest:
- Warn user: "This is a large project. I'll use aggressive context management."
- Split Phase 4 into execution groups with SEPARATE agent spawns per group
- Between groups: summarize completed work, clear context of prior group details
- Each specialist gets a completely fresh agent spawn (no accumulated context from prior specialists)

## Rule 6: Context-by-Reference Pattern

Every agent spawn uses this pattern:

```
## Context Files (read these first)
- {file-name}: {path} (focus on {specific sections})
...

## Your Task
{specific, focused task description}

## Output
Write results to: {output-path}
```

The orchestrator composes these instructions but does NOT read and paste files into the prompt.

**Exception:** For very short artifacts (< 50 lines), inline is acceptable.

## Implementation Checklist

When writing phase files, ensure:
- [ ] No inline pasting of prior phase outputs
- [ ] Agent prompts reference file paths, not content
- [ ] Orchestrator keeps only checkpoint summaries
- [ ] Each specialist gets independent agent spawn
- [ ] Large projects use execution group isolation
