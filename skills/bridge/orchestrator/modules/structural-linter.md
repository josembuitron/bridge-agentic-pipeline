# Post-Build Structural Linter

Runs AFTER each specialist completes a slice, ALONGSIDE the existing semgrep scan. This linter checks structural and architectural compliance that static analysis tools cannot detect.

**When to run:** After `BRIDGE_SLICE_COMPLETE` signal, before presenting results at the approval gate (Step 4.4).

**Who runs it:** The orchestrator runs these checks directly (Glob + Grep + Read), NOT a subagent. These are fast, deterministic checks that do not require LLM reasoning.

---

## Check 1: File Manifest Compliance

Compare files created by the specialist against the Architect's file manifest in `pipeline/03-solution-proposal.md`.

```
Orchestrator action:
1. Glob for all files in src/ and tests/ created/modified by the specialist
2. Read the specialist's section in 03-solution-proposal.md → extract expected file list
3. Compare:
   - Files in manifest but NOT created → WARN: "Missing: {file} — expected from architecture"
   - Files created but NOT in manifest → INFO: "Extra: {file} — not in original architecture (specialist deviation)"
```

**Severity:**
- Missing files in a Walking Skeleton (Slice 1): **ERROR** — architecture may be wrong
- Missing files in later slices: **WARN** — may be deferred to next slice
- Extra files: **INFO** — acceptable if specialist needed a helper (per deviation rules)

---

## Check 2: Import Direction Enforcement

Verify that import/dependency direction follows the architecture defined in `03-solution-proposal.md`.

```
Orchestrator action:
1. Read architecture overview from 03-solution-proposal.md → identify layer structure
   (e.g., Types → Config → Repo → Service → Runtime → UI)
2. For each file created by the specialist:
   - Grep for import/require statements
   - Check if imports follow the declared dependency direction
3. Flag violations:
   - "ARCH VIOLATION: {file} in layer '{A}' imports from layer '{B}' —
     architecture defines {B} depends on {A}, not the reverse.
     Fix: move shared code to a common layer, or restructure the import."
```

**Severity:**
- Layer direction violations: **ERROR** — must fix before next slice
- Cross-module imports within same layer: **WARN** — review at approval gate

**Detection patterns by language:**
| Language | Import Pattern |
|----------|---------------|
| TypeScript/JS | `import ... from '...'` or `require('...')` |
| Python | `import ...` or `from ... import ...` |
| Go | `import "..."` |
| Rust | `use ...;` or `mod ...;` |

**Graceful skip:** If the architecture doc does not define explicit named layers (e.g., "Layer: Types", "Layer: Service"), OR if fewer than 2 distinct layer names can be extracted, skip this check and log: "Import direction check skipped — no explicit layer structure defined in architecture."

---

## Check 3: Naming Convention Compliance

Verify files and exports follow the naming conventions from the architecture doc or project configuration.

```
Orchestrator action:
1. Detect project naming convention from existing files:
   - Files: kebab-case, camelCase, PascalCase, snake_case
   - Exports: camelCase functions, PascalCase classes/components
2. Check new files against the dominant convention
3. Flag outliers:
   - "NAMING: {file} uses {detected_case} but project convention is {expected_case}"
```

**Severity:** **WARN** — naming issues are style, not correctness

**Graceful skip:** If fewer than 3 existing files to establish a pattern, skip.

---

## Check 4: File Size Guard

Flag files that are growing too large for reliable agent editing in future sessions.

```
Orchestrator action:
1. For each file created/modified by specialist:
   - Count lines via Read tool
2. Flag:
   - > 300 lines: WARN "Consider splitting — large files reduce agent edit reliability"
   - > 500 lines: ERROR "Must split before next slice — file too large for reliable agent work"
```

**Severity:**
- 300-500 lines: **WARN**
- 500+ lines: **ERROR** — must be addressed

---

## Check 5: Test File Presence

Verify that code files have corresponding test files.

```
Orchestrator action:
1. For each source file in src/ created by specialist:
   - Check if a corresponding test file exists in tests/
   - Common patterns: foo.ts → foo.test.ts, foo.py → test_foo.py
2. Flag missing tests:
   - "TEST MISSING: {src_file} has no corresponding test file"
```

**Severity:** **WARN** — TDD should have created tests, but they may be in a shared test file

---

## Output Format

Append structural linter results to the specialist's slice summary presented at the approval gate:

```markdown
### Structural Linter Results
- ✅ File manifest: 5/5 expected files present
- ✅ Import direction: No layer violations
- ⚠️ Naming: `getUserData.ts` should be `get-user-data.ts` (project uses kebab-case)
- ✅ File size: All files under 300 lines
- ✅ Test coverage: 4/4 source files have test files

Errors: 0 | Warnings: 1 | Info: 0
```

---

## Error Enrichment Protocol

When ANY linter (structural, semgrep, eslint) reports an error, the orchestrator enriches the message before passing it to the agent for fixes:

### Enrichment Template
```
## Linter Finding: {tool} — {severity}

**What:** {original error message}

**Where:** {file}:{line} (in layer: {layer_name})

**Why this matters:** {context from architecture doc}
- This file is in the {layer} layer per 03-solution-proposal.md Section {X}
- The intended pattern for this layer is: {pattern description}

**How to fix:**
- {specific remediation step 1}
- {specific remediation step 2}
- Reference: {file path or doc section with the correct pattern}

**Do NOT:**
- {common wrong fix that would introduce a different violation}
```

### Enrichment by Tool

| Tool | Enrichment Source | Added Context |
|------|------------------|---------------|
| **semgrep** (CRITICAL) | `03-solution-proposal.md` | "BLOCKED. Fix before proceeding. See architecture Section {X} for intended pattern." |
| **semgrep** (WARNING) | `03-solution-proposal.md` | "Non-blocking but tracked. Pattern: {rule-id}. Review at approval gate." |
| **eslint** | Project's `.eslintrc` + architecture conventions | "Style violation. This project uses {convention}." |
| **structural linter** (ERROR) | `03-solution-proposal.md` layer definitions | "Architecture violation. {Layer A} cannot import from {Layer B}. Move to {suggested location}." |
| **structural linter** (WARN) | Project conventions | "Convention mismatch. {Detected} vs {Expected}." |

### When to Apply Enrichment

Enrichment runs ONLY when an agent needs to fix errors. The orchestrator:
1. Collects all linter findings after a slice
2. If findings include ERRORs or CRITICAL: enriches them and includes in the re-run prompt
3. If findings are only WARNs/INFOs: presents to user at approval gate, no agent re-run needed

### Context Budget Guard

Enriched error messages must stay concise:
- Max 5 enriched findings per re-run (prioritize by severity)
- Each enrichment < 100 words
- If >5 findings: group by category and provide counts ("+ 3 more naming warnings")
- Reference file paths for deeper context instead of inlining

---

## Integration with Existing Phase 4 Flow

```
BRIDGE_SLICE_COMPLETE signal
  ↓
Existing: semgrep scan --config auto (MANDATORY)
  ↓
NEW: Structural Linter checks (1-5)
  ↓
IF any ERROR/CRITICAL findings:
  → Enrich error messages (Error Enrichment Protocol)
  → Re-run specialist with enriched findings in prompt
  → Linter-triggered re-runs count toward the slice's max 3 total attempts
    (see 04-build.md Dev-QA Loop). If 3 total attempts exhausted, escalate
    to human regardless of remaining linter re-run budget.
  ↓
IF only WARN/INFO findings:
  → Include in approval gate summary
  ↓
Step 4.4: HUMAN APPROVAL GATE (existing, unchanged)
```

This flow adds structural checking WITHOUT modifying the existing semgrep scan or approval gate logic.
