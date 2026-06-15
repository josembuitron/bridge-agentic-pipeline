# Per-Slice Independent-Review Enforcement Hook

This module is the difference between BRIDGE *asking* for an independent per-slice review and
BRIDGE *guaranteeing* one. Everything else about the per-slice review (Step 4.3.5) is an
instruction the orchestrator is supposed to follow. Instructions are advisory: a tired,
context-starved, or rationalizing orchestrator can skip them, which is exactly the failure
mode that shipped a self-graded slice in the field. This hook is a deterministic shell-level
gate that the orchestrator cannot talk its way past.

Defense in depth, from softest to hardest:
1. **Prompt embedding** (belt) -- TDD/verification methodology pasted into specialist prompts.
2. **Orchestrator-run skills as live gates** (suspenders) -- Step 4.3.5/4.3.6.
3. **This hook** (the lock) -- a Stop hook that BLOCKS the pipeline from ending while any
   high-risk slice is complete without a valid independent review.

## What it enforces

The script `orchestrator/scripts/verify-slice-reviews.js` reads two files in the project's
`pipeline/` directory:
- `04-slice-ledger.json` -- the structured per-slice record (see 04-build.md Step 4.3.0).
- `04-build-manifest.md` -- scanned only for `BRIDGE_SLICE_COMPLETE: <id>` completion tokens.

A slice is "effectively complete" if the ledger marks it complete OR the manifest emitted its
completion token (so you cannot dodge by marking it done in the manifest while leaving the
ledger `pending`). For every effectively-complete slice the hook requires:
- it is registered in the ledger (a manifest completion with no ledger entry is a violation);
- if `risk == "high"`: a `review` with `reviewer_agent` present and **different from**
  `builder_agent`, a `verdict` of `PASS` or `PASS-WITH-NOTES`, and a review `artifact` file
  that actually exists on disk.

Any violation -> the hook exits 2 and BLOCKS, feeding the specific reasons back to the
orchestrator so it must run the missing review before it can finish.

## Claude Code hook exit-code semantics (READ THIS -- the rest of BRIDGE's hook docs had it wrong)

For PreToolUse and Stop hooks in Claude Code:
- **exit 0** = allow (proceed / allow the stop).
- **exit 2** = BLOCK; stderr is fed back to Claude as the reason. THIS is the blocking code.
- any other non-zero = non-blocking error surfaced to the user.

Earlier BRIDGE hook docs claimed "exit 2 = warn, exit 1 = block", which is backwards: it
means the older "enforce mode" hooks likely never actually blocked. This module uses exit 2
to block, which is correct. The `verify-slice-reviews.js` script fails OPEN (exit 0) only on
whole-file transients (no ledger, a half-written/unparseable ledger FILE, or a top-level
script error) so it can never wedge a run on a transient state or its own bug. A malformed
individual slice ENTRY, by contrast, fails CLOSED (it becomes a violation and blocks), and a
slice requires review unless it is EXPLICITLY the string "standard" - so a missing, mistyped,
or wrong-typed risk/reviewer field can never silently slip a high-risk slice past the gate.

## Installation (Phase 0)

Installed by default whenever `config.workflow.per_slice_review != "off"`. Two steps:

1. Copy the script into the project so the project owns its hook:
   ```
   {skill}/orchestrator/scripts/verify-slice-reviews.js  ->  {project-path}/.claude/hooks/verify-slice-reviews.js
   ```
2. Register the Stop hook in `{project-path}/.claude/settings.json`:
   ```json
   {
     "hooks": {
       "Stop": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "node \"{project-path}/.claude/hooks/verify-slice-reviews.js\" \"{project-path}\""
             }
           ]
         }
       ]
     }
   }
   ```
   Merge this `Stop` entry alongside any existing `PreToolUse`/`PostToolUse` pipeline-protection
   hooks; do not overwrite them.

Default mode is **enforce** (the env var is simply unset). The hook is the one place BRIDGE
defaults to blocking rather than warn, because the whole point of v2.2.0 is to make the review
a guarantee, not a suggestion.

## Override (never trap the operator)

- For a single run where blocking is genuinely unwanted: `export BRIDGE_REVIEW_HOOK_MODE=warn`.
  The hook then prints the same findings but exits 0.
- To disable entirely: set `config.workflow.per_slice_review: "off"` (the hook is not installed)
  or remove the `Stop` entry from the project's settings.json.
Every block message includes the warn-mode override instruction, so the operator is never
stuck without a documented way forward.

## Honest limitations (what the hook does NOT guarantee)

- It enforces that a **different agent** produced a **passing review artifact** for each
  high-risk slice. It cannot judge whether that review was *good* -- only that it happened,
  by someone other than the builder, with a pass verdict and a real artifact. Review quality
  still rides on the reviewer model (which is why reviewers inherit the session model -- see
  `modules/model-routing.md`).
- It trusts the architect's `Risk:` flags. A genuinely high-risk slice mislabeled `standard`
  escapes the gate. The flag lives in `03-solution-proposal.md` and is the architect's
  judgment call; the plan-checker and Ojo Critico are the backstops there, not this hook.
- It stops the *passive* failure (laziness, end-loading, self-grading under token pressure --
  the field-reported mode). It does not stop *active* deception (an orchestrator fabricating a
  fake review artifact), which would require deliberate effort and leaves an artifact on disk
  that a human or Phase 5 can inspect.
