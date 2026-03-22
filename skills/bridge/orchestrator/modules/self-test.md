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

[PASS] Core module references — all N paths valid
[PASS] Phase files — 7/7 present
[FAIL] Module completeness — missing: pipeline-state.md (listed in core.md but not on disk)
[PASS] Templates — agent-template.md found
[WARN] Agent definitions — spec-etl.md has tool "kubectl" not in tool-matrix.md
[PASS] Reference docs — all 6 reference docs found
[PASS] Client data protection — .gitignore protects clients/
[PASS] SKILL.md entry point — bootstrap valid

Result: 7 PASS, 1 FAIL, 1 WARN
```

If all pass: `Pipeline structure intact.`
If any fail: `Structure issues found. Fix before running pipeline.`
