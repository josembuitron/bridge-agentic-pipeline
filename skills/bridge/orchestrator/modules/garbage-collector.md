# Garbage Collection Module

Extends the De-Sloppify pass (Step 4.5) with entropy detection and codebase hygiene checks inspired by OpenAI's Harness Engineering practice of recurring cleanup agents.

**When to run:** As part of Step 4.5 (De-Sloppify), after all specialists complete. The De-Sloppify agent receives these checks as additional instructions.

**Design rationale:** OpenAI runs garbage collection as background agents on a schedule. BRIDGE runs as a single session pipeline, so GC runs once before validation -- same effect, adapted to the execution model.

---

## Garbage Collection Checks

### GC-1: Dead Code Detection

Identify code that was created but never integrated:

```
Instructions for De-Sloppify agent:
1. Grep for exported functions/classes across src/
2. For each export: Grep for its import across all other files
3. Flag exports with zero imports as: "UNUSED EXPORT: {symbol} in {file}"
4. Check for files that are not imported by any other file (orphaned files)
5. Flag orphaned files as: "ORPHANED FILE: {file} -- not imported anywhere"
```

**Action:** List candidates. Do NOT auto-delete -- present to orchestrator for the approval gate. Dead code may be intentional (entry points, CLI commands, test utilities).

**Exception:** Entry point files (index.ts, main.py, app.ts, server.ts) and test files are never flagged as orphaned.

### GC-2: Pattern Consistency Audit

Find code that does the same thing in different ways:

```
Instructions for De-Sloppify agent:
1. Identify the dominant pattern for each category:
   a. Error handling: try/catch vs .catch() vs Result type
   b. Logging: console.log vs logger.info vs custom
   c. API calls: fetch vs axios vs custom client
   d. State management: useState vs useReducer vs store
   e. Data validation: zod vs joi vs manual checks
2. For each category: find files that deviate from the dominant pattern
3. Flag deviations as: "PATTERN INCONSISTENCY: {file} uses {pattern_B} but project dominant is {pattern_A}"
```

**Action:** WARN only. Inconsistencies are reported at approval gate. Do not auto-fix -- changing patterns may break functionality.

### GC-3: Architecture Drift Detection

Compare actual implementation against the architecture defined in Phase 3:

```
Instructions for De-Sloppify agent:
1. Read 03-solution-proposal.md → extract:
   a. Expected file structure (Section B: File Manifest)
   b. Expected component relationships (Section A: Architecture Overview)
   c. Expected data flow (Section A: Mermaid diagrams)
2. Glob actual src/ structure
3. Compare and flag:
   a. Files in manifest not created → "MISSING FROM ARCHITECTURE: {file}"
   b. Files created not in manifest → "UNPLANNED FILE: {file}"
   c. Modules with circular imports → "CIRCULAR DEPENDENCY: {A} ↔ {B}"
```

**Severity:**
- Missing from architecture: **WARN** (may be deferred to future work)
- Circular dependencies: **ERROR** (must be resolved before validation)
- Unplanned files: **INFO** (specialists may have needed helpers)

### GC-4: Documentation Freshness Check

Verify that documentation artifacts reflect the actual codebase:

```
Instructions for De-Sloppify agent:
1. If README.md exists in project root:
   a. Grep for file paths mentioned in README → verify each exists
   b. Grep for function/class names mentioned → verify they exist in src/
   c. Flag stale references: "STALE DOC: README.md references {X} but it doesn't exist"
2. If inline comments reference other files (e.g., "see utils/helper.ts"):
   a. Verify referenced files exist
   b. Flag broken references
3. If environment variables are documented:
   a. Grep .env.example or README for env var names
   b. Grep src/ for actual env var usage
   c. Flag documented but unused, and used but undocumented
```

**Action:** WARN only. Doc freshness issues are presented at approval gate and forwarded to the Validator in Phase 5 for the Doc-Architecture Sync check.

### GC-5: Duplicate Code Detection

Find similar code blocks that could be extracted into shared utilities:

```
Instructions for De-Sloppify agent:
1. Read all source files
2. Identify code blocks >10 lines that appear with minor variations in 2+ files
3. Flag duplicates: "DUPLICATE CODE: Similar block in {file_A}:{lines} and {file_B}:{lines}"
4. Suggest extraction: "Consider extracting to shared utility in {suggested_path}"
```

**Action:** INFO only. Duplication is common in early development. Present at approval gate but do not auto-extract -- extraction changes module boundaries which is an architecture decision.

---

## Output Format

The De-Sloppify agent includes GC results in its output:

```markdown
## De-Sloppify Results

### Standard Cleanup (existing)
- Removed 3 unused imports
- Fixed 2 naming inconsistencies
- Removed 1 debug console.log

### Garbage Collection Findings (Harness Engineering)

#### Dead Code (GC-1)
- [ok] No orphaned files found
- [WARN] 1 unused export: `formatCurrency()` in `src/utils/format.ts`

#### Pattern Consistency (GC-2)
- [ok] Error handling: consistent (try/catch)
- [WARN] Logging: 2 files use console.log, 5 use logger.info

#### Architecture Drift (GC-3)
- [ok] 12/12 manifest files present
- [INFO] 2 unplanned helper files created by specialists

#### Documentation Freshness (GC-4)
- [WARN] README.md references `src/config/db.ts` which doesn't exist

#### Duplicate Code (GC-5)
- [INFO] Similar validation block in auth.ts:45-58 and user.ts:23-36

Summary: 0 Errors | 3 Warnings | 2 Info
```

---

## Integration with Step 4.5

The orchestrator embeds GC instructions in the De-Sloppify agent prompt as an **additional section**:

```markdown
## Additional: Garbage Collection (Harness Engineering)

After standard cleanup, perform these additional checks.
Read `modules/garbage-collector.md` for full check definitions.

Focus on: dead code (GC-1), pattern consistency (GC-2), architecture drift (GC-3),
documentation freshness (GC-4), duplicate code (GC-5).

IMPORTANT:
- Do NOT auto-delete dead code or extract duplicates
- Report findings in your output using the format above
- Only auto-fix: naming inconsistencies, unused imports, debug statements (standard De-Sloppify scope)
- Everything else is REPORTED for the approval gate
```

**If De-Sloppify is skipped** (config.workflow.de_sloppify = false OR <200 lines):
- The orchestrator runs GC-1 (dead code) directly (Glob + Grep, no subagent -- purely mechanical)
- For GC-3 (architecture drift): orchestrator runs only the mechanical file-count comparison (files present vs. manifest). Skip circular dependency detection (requires analytical reasoning, violates core.md rule of >20 lines inline = spawn subagent).
- Checks 2, 4, 5 are skipped (they require reading code patterns, better done by agent)
- Results are presented at the Phase 4 final approval gate
