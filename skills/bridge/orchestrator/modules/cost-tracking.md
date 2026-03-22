# Cost Tracking

Approximate token/cost tracking per phase for budget awareness.

## Per-Phase Logging

After each agent completes, the orchestrator logs to `pipeline/cost-log.json`:

```json
{
  "phases": [
    {
      "phase": 1,
      "agent": "requirements-translator",
      "model": "sonnet",
      "estimated_input_tokens": 4500,
      "estimated_output_tokens": 3200,
      "estimated_cost_usd": 0.04
    }
  ],
  "total_estimated_cost_usd": 0.04,
  "budget_cap_usd": null,
  "timestamp": "2026-03-21T14:30:00Z"
}
```

## Cost Estimation Formula (approximate)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|----------------------|
| Opus (`claude-opus-4-6`) | $15.00 | $75.00 |
| Sonnet (`claude-sonnet-4-6`) | $3.00 | $15.00 |
| Haiku (`claude-haiku-4-5-20251001`) | $0.80 | $4.00 |

### Estimation Method
Since Claude Code doesn't expose exact token counts to skills, estimate by:
- **Input tokens**: Size of files read (chars ÷ 4) + prompt size
- **Output tokens**: Size of files written (chars ÷ 4) + response overhead (~500 tokens)

This is a rough estimate (±50%). Do not present it as precise — it's for budget awareness only.

## When to Track (Orchestrator Workflow)

The orchestrator executes cost tracking at these specific moments:

### 1. After EVERY agent spawn returns

```
Agent returned → immediately:
1. Glob for files the agent was TOLD to read (from the context-by-reference block)
   - Sum their sizes: wc -c {each file} → total chars ÷ 4 = estimated input tokens
   - Add prompt size estimate (count words in the prompt you sent × 1.33)
2. Glob for files the agent WROTE or MODIFIED
   - Sum their sizes: wc -c {each file} → total chars ÷ 4 = estimated output tokens
   - Add 500 tokens for response overhead
3. Look up model used (from agent's frontmatter or model-routing.md)
4. Calculate: (input_tokens × input_rate) + (output_tokens × output_rate)
5. Append entry to pipeline/cost-log.json
6. Update total_estimated_cost_usd
7. If budget_cap_usd is set: check thresholds (80%, 100%)
```

### 2. At Phase 0 initialization

During Step 0.4 (Initialize Configuration), ask the user:
```
Budget: Would you like to set a cost cap for this pipeline run?
  a) No limit (default) — just track and report at the end
  b) Set cap: $___
```
Store in `pipeline/config.json` as `budget_cap_usd`.

### 3. At pipeline end (or early exit)

Write the cost summary to `pipeline/internal-summary.md` (see Final Summary below).

## Budget Cap (Optional)

User can set in `pipeline/config.json`:
```json
"budget_cap_usd": 5.00
```

### Budget Enforcement
- At 80% of cap → WARN user:
  ```
  ⚠️ Estimated cost: ${X} of ${cap} budget (80%)
  Remaining phases may push past budget.
  Continue or adjust scope?
  ```
- At 100% of cap → PAUSE and ask:
  ```
  Estimated cost reached ${X}. Budget was ${cap}.
  Options:
    a) Increase budget to ${X * 1.5}
    b) Stop here and generate deliverables
    c) Continue without budget limit
  ```

When `budget_cap_usd` is `null` (default): no enforcement, just log.

## Final Summary

At pipeline end, include cost summary in `pipeline/internal-summary.md`:
```
## Cost Estimate
Total estimated cost: $X.XX
Agent invocations: N
Model breakdown:
  - Opus: $X.XX (N calls)
  - Sonnet: $X.XX (N calls)
  - Haiku: $X.XX (N calls)
Note: This is a rough approximation (±50%). Actual costs may vary significantly.
```

**NOTE:** Never include cost details in client deliverables. Cost tracking is internal only.
