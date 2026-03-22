# Stryker Mutation Testing — CLI Reference

Mutation testing introduces small code changes (mutations) and verifies your tests catch them. If tests still pass after a mutation, they are too weak.

## Installation

```bash
# Install Stryker with vitest runner
npm install -D @stryker-mutator/core @stryker-mutator/vitest-runner

# Initialize configuration (interactive)
npx stryker init

# Or create config manually (see below)
```

## Running

```bash
# Full mutation run
npx stryker run

# Mutate only specific files
npx stryker run --mutate "src/core/**/*.ts"

# Mutate only changed files (incremental — best for CI)
git diff --name-only origin/main | xargs npx stryker run --mutate
```

## Configuration (stryker.config.json)

```json
{
  "$schema": "https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "vitest",
  "mutate": [
    "src/**/*.ts",
    "src/**/*.js",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/**/generated/**"
  ],
  "reporters": ["progress", "clear-text", "html", "json"],
  "htmlReporter": { "fileName": "reports/mutation/index.html" },
  "thresholds": { "high": 80, "low": 60, "break": 50 },
  "concurrency": 4,
  "timeoutMS": 60000
}
```

### Key config options

| Option | Purpose | Example |
|--------|---------|---------|
| `testRunner` | Test framework | `"vitest"`, `"jest"`, `"mocha"` |
| `mutate` | Files to mutate (glob) | `["src/**/*.ts", "!src/**/*.test.ts"]` |
| `thresholds.break` | Fail CI if score below this | `50` |
| `thresholds.high` | Green in report | `80` |
| `concurrency` | Parallel workers | `4` (increase for faster runs) |
| `timeoutMS` | Max time per mutation test | `60000` |

### Exclude noisy mutators

```json
{
  "mutator": {
    "excludedMutations": ["StringLiteral", "ObjectLiteral"]
  }
}
```

## Mutation Operators

### Arithmetic: `+` → `-`, `*`, `/`
### Comparison: `>` → `>=`, `<`, `<=`, `==`
### Logical: `&&` → `||`, `!a` → `a`
### Boundary: `i < 10` → `i <= 10`, `i < 11`
### Return: `return value` → `return undefined`, `return !value`, `return ""`, `return 0`

## Understanding Results

| State | Meaning | Action |
|-------|---------|--------|
| **Killed** | Test failed = mutation caught | Good |
| **Survived** | Tests passed = mutation missed | Add tests for this case |
| **Timeout** | Tests took too long | Check for infinite loops |
| **No Coverage** | No tests cover this code | Write tests |
| **Compile Error** | Mutation broke build | Ignore |

### Mutation Score

```
Score = (Killed / Total) × 100%
```

| Score | Quality | BRIDGE Action |
|-------|---------|---------------|
| > 80% | Excellent | PASS |
| 60-80% | Good, room for improvement | WARNING |
| < 60% | Weak tests | CRITICAL — add tests |

## When BRIDGE Should Use Stryker

- **Phase 5** when `config.workflow.mutation_testing = true`
- Focus on: critical business logic, security-sensitive code, validation logic, state machines
- Skip: generated code, config files, UI components, test utilities

## BRIDGE Integration Command

```bash
# Run mutation testing on project source (Phase 5)
cd clients/{c}/{p} && npx stryker run --mutate "src/core/**/*.{ts,js}" --reporters clear-text,json 2>/dev/null
```

Parse JSON output for mutation score. Apply thresholds from config.
