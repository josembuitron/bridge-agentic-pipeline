# Pipeline Self-Test (Structural Validation)

Validates that the modular pipeline structure is intact without running the full pipeline. Execute when the user says "bridge test", "bridge self-test", or "/bridge test".

## Checklist

Run each check. Report results as a checklist with pass/fail per item.

### 1. Core Module References

Read `skills/bridge/orchestrator/core.md`. For every file path listed under "Phase Files" and "Module Files", Glob to verify the file exists.

```
Expected: All paths in core.md resolve to existing files
Fail if: Any referenced file is missing
```

### 2. Phase File Completeness

Glob `skills/bridge/orchestrator/phases/*.md`. Verify these exist:
- `00-initialization.md`
- `00b-codebase-analysis.md`
- `01-translate.md`
- `02-research.md`
- `03-architect.md`
- `04-build.md`
- `05-validate.md`

```
Expected: All 7 phase files present
Fail if: Any phase file missing
```

### 3. Module File Completeness

Glob `skills/bridge/orchestrator/modules/*.md`. Cross-reference with the module list in `core.md`. Report any modules listed in core.md but missing from disk, OR present on disk but not listed in core.md.

```
Expected: 1:1 match between core.md references and actual files
Fail if: Orphaned modules (on disk but not in core.md) or phantom references (in core.md but not on disk)
```

### 4. Templates

Glob `templates/*.md`. Verify at minimum:
- `templates/agent-template.md`

```
Expected: Agent template exists
Fail if: Template missing
```

### 5. Agent Definitions

Glob `.claude/agents/*.md`. For each agent, verify:
- File has YAML frontmatter with `name:` and `tools:`
- Tools listed match a valid subset from `modules/tool-matrix.md`

```
Expected: All agent files have valid frontmatter
Warn if: Agent has tools not listed in tool-matrix.md (may be valid but worth flagging)
```

### 6. Reference Documentation

Glob `docs/reference/*.md`. Cross-reference with the CLI tools table in `modules/available-plugins.md`. Report any CLI tool that claims a reference doc but the doc doesn't exist.

```
Expected: Every CLI tool with a "Reference" column pointing to docs/reference/ has that file
Fail if: Referenced doc missing
```

### 7. Client Data Protection

Read `.gitignore`. Verify it contains a rule that excludes `clients/` from version control.

```
Expected: .gitignore contains "clients/" or "clients/*"
Fail if: clients/ directory not protected by .gitignore
```

### 8. SKILL.md Entry Point

Read `skills/bridge/SKILL.md`. Verify:
- Has YAML frontmatter with `name: bridge`
- References `skills/bridge/orchestrator/core.md` in its bootstrap section

```
Expected: SKILL.md properly bootstraps to core.md
Fail if: Bootstrap reference missing or incorrect
```

## Output Format

```
=== BRIDGE Self-Test Results ===

[PASS] Core module references -- all N paths valid
[PASS] Phase files -- 7/7 present
[FAIL] Module completeness -- missing: pipeline-state.md (listed in core.md but not on disk)
[PASS] Templates -- agent-template.md found
[WARN] Agent definitions -- spec-etl.md has tool "kubectl" not in tool-matrix.md
[PASS] Reference docs -- all 6 reference docs found
[PASS] Client data protection -- .gitignore protects clients/
[PASS] SKILL.md entry point -- bootstrap valid

Result: 7 PASS, 1 FAIL, 1 WARN
```

If all pass: `Pipeline structure intact.`
If any fail: `Structure issues found. Fix before running pipeline.`

---

## Harness Component Audit (from Anthropic's Harness Design research)

**Trigger:** Run when user says "bridge audit", "audit harness", or after 5+ projects completed.

Anthropic's research states: "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing." As models improve, some BRIDGE components may become overhead rather than value.

### Audit Checklist

For each major pipeline component, ask: **Is this still load-bearing, or could the model handle this natively now?**

| Component | Assumption it encodes | How to test if still needed |
|---|---|---|
| **Ojo Critico** (critical review) | "Generators can't self-evaluate" | Run 3 pipelines with and without. Compare rejection rates in Phase 5. |
| **Vertical Slice decomposition** | "Model can't handle full-feature chunks" | Try one specialist with 2-3 slices merged. Does quality hold? |
| **De-Sloppify pass** | "Build agents leave dead code" | Check last 3 pipeline runs: did De-Sloppify find significant issues? |
| **Structural Linter** | "Agents drift from file manifests" | Check last 3 runs: linter error rate. If <5%, consider advisory-only. |
| **Per-slice security scan** | "Security issues compound if not caught early" | Compare: scan-per-slice vs scan-at-end. Same finding count? |
| **Sprint/Slice contracts** | "Evaluators need mechanical criteria" | Compare validator verdicts with/without contracts on same project. |
| **Context refresh every 2 specialists** | "Context degrades after 2 agents" | Try 3-4 agents between refreshes. Quality decline? |
| **Analysis Paralysis Guard (5 reads)** | "Agents over-read before writing" | Raise threshold to 8. Does stall rate increase? |
| **Phase-based planner (Phases 1-3)** | "Models under-scope without planning" | Compare planner-generated spec vs solo agent spec for same prompt. |

### Audit Output

Write to `pipeline/harness-audit-{date}.md`:
```markdown
# BRIDGE Harness Component Audit -- {date}

## Still Load-Bearing (keep)
- {component}: {evidence it's still needed}

## Candidates for Simplification
- {component}: {evidence it may be overhead}. Recommendation: {reduce/remove/make optional}

## Candidates for Enhancement
- {component}: {evidence it should be strengthened}. Recommendation: {what to add}

## Model Capability Notes
- Current model: {model ID}
- Key improvements since last audit: {list}
```

**Critical principle:** "When new models arrive, strip away components no longer load-bearing and add new pieces for greater capability." (Anthropic, 2026). BRIDGE should get SIMPLER over time, not just larger.
