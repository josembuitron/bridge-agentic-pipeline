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

This is a rough estimate (±30%) but sufficient for budget awareness.

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
Note: This is an approximation (±30%). Actual costs may vary.
```

**NOTE:** Never include cost details in client deliverables. Cost tracking is internal only.
