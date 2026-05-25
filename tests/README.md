# BRIDGE Tests

This directory holds three kinds of tests:

```
tests/
  structural/   Layout and reference integrity checks. Run on every PR.
  fixtures/     Canonical input artifacts (transcripts, emails) used by future e2e runs.
  e2e/          (Future) End-to-end pipeline runs against fixtures. Not in scope for v2.0.
```

## Running the structural suite

```
npm test
```

Runs `tests/structural/test-required-files.js` followed by `tests/structural/test-module-references.js`. Exits 0 on success, non-zero with a list of missing files or broken references on failure.

These tests are intentionally narrow: they prove the skill layout is internally consistent. They do not exercise pipeline behavior. Behavioral tests (does Phase 1 produce a valid Technical Definition from a transcript?) belong in `e2e/` once that exists.

## Adding a fixture

A fixture is a single markdown file in `tests/fixtures/` that represents a realistic input the pipeline must handle. Naming: `tests/fixtures/{kind}-{slug}.md` where `kind` is one of `transcript`, `email`, `chat`, `brief`.

Each fixture is fully anonymized -- no real client names, no internal jargon, no proprietary data. Aim for 15-40 lines: enough context to exercise the Translator and Researcher, not so much that the test takes forever.

A useful fixture includes:
- A business challenge (the BRIDGE B input)
- Hints at root causes and impact (BRIDGE R and I)
- One or two data sources or systems mentioned by name (BRIDGE D)
- Some ambiguity that should trigger the Assumption Elimination Gate
- A request, even if vague, about what success looks like

When you add a fixture, list it in this README under "Available fixtures" so others know it exists.

## Available fixtures

- `transcript-data-pipeline.md` -- mid-market manufacturer asks for a data pipeline; touches ERP, BI, and a vague "executive dashboard" requirement.
- `email-api-integration.md` -- short email requesting a CRM-to-ERP integration with multiple unspecified constraints; deliberately under-specified to exercise discovery.

## Future work

- E2E test runner that pipes a fixture through Phase 1 and asserts on the Technical Definition shape.
- Coverage tracking for which modules each fixture exercises.
- Replay test against last known-good outputs to catch silent regressions.
