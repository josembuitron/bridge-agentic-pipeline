# Cost-Aware Model Routing

Use the right model for each phase to balance quality and cost.

## Default Routing Table

| Phase / Task Type | Model | Reason |
|---|---|---|
| Phase 3 (Architect) | `claude-opus-4-6` | Architecture decisions require strongest reasoning |
| Phase 5 (Validator, security review) | `claude-opus-4-6` | Security + BRIDGE alignment is high-stakes |
| Phase 1 (Translator) | `claude-sonnet-4-6` | Standard quality, cost-efficient |
| Phase 2 (Researcher) | `claude-sonnet-4-6` | Broad research; Sonnet handles it well |
| Phase 4 (code builders) | `claude-sonnet-4-6` | Standard quality, cost-efficient |
| De-Sloppify pass | `claude-haiku-4-5-20251001` | Simple cleanup doesn't need heavy reasoning |
| Ojo Critico reviews | `claude-sonnet-4-6` | Review is structured; Sonnet sufficient |

## Model Profiles (from config.json)

```json
"model_profiles": {
  "quality":  { "architect": "opus", "validator": "opus", "builders": "sonnet", "cleanup": "sonnet" },
  "balanced": { "architect": "opus", "validator": "opus", "builders": "sonnet", "cleanup": "haiku" },
  "budget":   { "architect": "sonnet", "validator": "sonnet", "builders": "sonnet", "cleanup": "haiku" }
}
```

The orchestrator reads `config.model_profile` and uses the corresponding profile. Set `model:` in each agent's `.md` frontmatter when creating/spawning.

If the user explicitly asks for a specific model globally, override all agents to that model.
