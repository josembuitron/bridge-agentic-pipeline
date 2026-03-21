---
name: eslint-runner
description: >
  JavaScript/TypeScript linting and auto-fix via eslint CLI. Use for code quality checks,
  style enforcement, and automatic code fixes.
  Trigger on: "lint the code", "eslint", "check code style", "fix linting errors",
  "code quality check", or any request to enforce coding standards in JS/TS projects.
---

# eslint -- Code Quality Linting

eslint finds and fixes problems in JavaScript/TypeScript code.

## Quick Commands

```bash
# Lint current directory
npx eslint .

# Lint specific files
npx eslint src/**/*.ts

# Auto-fix what it can
npx eslint . --fix

# JSON output for pipeline processing
npx eslint . --format json > eslint-results.json

# Show only errors (skip warnings)
npx eslint . --quiet

# Lint with specific config
npx eslint . --config eslint.config.mjs
```

## Pipeline Integration

For code-writing specialists, run after implementation:
```bash
npx eslint src/ --format json > pipeline/eslint-results.json
```

Parse results to feed into quality_score `code_quality` component.
Count errors and warnings to determine pass/fail threshold.
