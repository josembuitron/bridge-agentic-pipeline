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
Errors encountered: {list of errors and how resolved, or "none"}
User feedback incorporated: {list of user corrections/preferences, or "none"}
Key decisions: {bullet list}
Full output: pipeline/{NN}-{name}.md
Next: Phase {N+1}
```

The "Errors encountered" and "User feedback incorporated" fields are critical for:
- Preventing the same mistakes in subsequent phases
- Enabling the rejection loop to be informed (see Rule 10)
- Giving the Karpathy Loop (Step 5.5b) data to correlate decisions with outcomes

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

## Rule 7: Phase-Based Context Refresh

The orchestrator cannot count its own accumulated tokens. Instead, use **phase transitions** as mandatory refresh points:

1. **Before entering Phase 4** (the heaviest phase): Re-read `core.md` to refresh the full protocol. This is non-negotiable — Phase 4 spawns many agents and context degradation here is fatal.
2. **Every 2 specialists in Phase 4**: After spawning 2 specialists, re-read `core.md` section "CRITICAL RULES" and the current project's `pipeline/state.json` (if exists). This prevents drift mid-build.
3. **Before Phase 5**: Re-read `core.md` and `phases/05-validate.md` fresh. Validation requires the orchestrator to be precise — no shortcuts.
4. **If the user resumes a project**: Re-read `core.md` + `pipeline/state.json` + last checkpoint file BEFORE doing anything else.

## Rule 8: Agent Prompt Size Guard

Before spawning ANY agent, the orchestrator estimates the composed prompt size:

1. **Heuristic**: Count the approximate words in the prompt you're about to send. If it exceeds **750 words** (~3,000 tokens), it's too large.
2. **If too large**:
   - Extract the longest section (usually methodology or context) to a temporary file: `pipeline/tmp-{agent-name}-context.md`
   - Replace inline content with: `Read pipeline/tmp-{agent-name}-context.md for {section}`
   - The agent reads it from disk using its own fresh context window
3. **Log**: After each agent spawn, note the estimated prompt size in `pipeline/cost-log.json` under the agent's entry (field: `prompt_words`).

**Quick check**: If you're pasting more than 2 paragraphs into an agent prompt, you're violating this rule.

## Rule 9: Emergency Context Recovery

If the orchestrator detects ANY of these degradation signals in its own behavior:
- Repeating instructions it already gave
- Generating generic/template content instead of project-specific content
- Forgetting configuration values it read earlier
- Losing track of which phase or specialist it's on
- Producing unusually short or vague responses

**Recovery protocol:**
1. STOP current work
2. Re-read `skills/bridge/orchestrator/core.md` (full file)
3. Re-read `pipeline/state.json` (if exists) OR scan `pipeline/` for latest files
4. Re-read ONLY the last checkpoint summary file in `pipeline/`
5. Resume from that checkpoint

This is the LLM equivalent of "when you're lost, go back to the map." It costs one turn but prevents cascading errors.

## Rule 10: Rejection Loop Memory

When a phase is rejected and must be re-run, the orchestrator MUST prevent the re-run agent from repeating the same mistake:

1. **Before re-spawning**: Write a rejection checkpoint:
   ```
   Phase {N} REJECTED. Reason: {user's feedback or validator finding}.
   Specific issues: {list from feedback-routing.json or user message}
   Previous attempt wrote: pipeline/{NN}-{name}.md (will be overwritten)
   ```

2. **In the re-run agent prompt**: Include the rejection context:
   ```
   ## Previous Attempt Feedback
   Your previous output was rejected because: {reason}
   Specific issues to address:
   - {issue 1}
   - {issue 2}
   Do NOT repeat these mistakes. Address each issue explicitly in your output.
   ```

3. **After re-run approval**: Update the checkpoint to normal format (Rule 4) and note it was a re-run:
   ```
   Phase {N} complete (re-run after rejection). Summary: {3-5 lines}.
   Errors encountered: Previous attempt rejected for {reason}. Fixed by {what changed}.
   ...
   ```

This rule ensures that re-runs are informed, not blind retries.

---

## Implementation Checklist

When writing phase files, ensure:
- [ ] No inline pasting of prior phase outputs
- [ ] Agent prompts reference file paths, not content
- [ ] Orchestrator keeps only checkpoint summaries
- [ ] Each specialist gets independent agent spawn
- [ ] Large projects use execution group isolation
- [ ] Phase transitions trigger context refresh (Rule 7)
- [ ] Agent prompts stay under 750 words (Rule 8)
- [ ] Degradation signals trigger recovery protocol (Rule 9)
- [ ] Rejection re-runs include previous attempt feedback (Rule 10)
