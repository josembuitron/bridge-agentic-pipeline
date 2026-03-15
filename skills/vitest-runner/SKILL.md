---
name: vitest-runner
description: >
  Fast test runner via vitest CLI with coverage analysis. Use for running unit tests,
  integration tests, and measuring code coverage during TDD and validation.
  Trigger on: "run tests", "test coverage", "vitest", "unit test", "run the test suite",
  or any request to execute or analyze test results in JavaScript/TypeScript projects.
---

# vitest -- Fast Test Runner with Coverage

vitest runs JavaScript/TypeScript tests with built-in coverage, watch mode, and structured output.

## Quick Commands

```bash
# Run all tests
npx vitest run

# Run tests with coverage
npx vitest run --coverage

# Run specific test file
npx vitest run src/utils.test.ts

# Run tests matching pattern
npx vitest run --grep "authentication"

# Watch mode (re-runs on file change)
npx vitest

# JSON output for pipeline processing
npx vitest run --reporter=json > test-results.json

# Coverage with thresholds (fail if below)
npx vitest run --coverage --coverage.thresholds.lines=80 --coverage.thresholds.functions=80
```

## Pipeline Integration

For TDD workflow in specialist agents:
```bash
# 1. Write test first
# 2. Run and confirm it fails
npx vitest run src/feature.test.ts
# 3. Implement
# 4. Run and confirm it passes
npx vitest run src/feature.test.ts
# 5. Run full suite + coverage
npx vitest run --coverage --reporter=json > pipeline/test-results.json
```

Coverage feeds into quality_score `test_pass_rate` component.
