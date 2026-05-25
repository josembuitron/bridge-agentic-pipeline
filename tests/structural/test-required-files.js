#!/usr/bin/env node

// Verifies that every required file in the BRIDGE skill layout exists.
// Exits 0 if all present, 1 with a list of missing paths otherwise.

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED = [
  // Skill top-level
  'skills/bridge/SKILL.md',
  'skills/bridge/orchestrator/core.md',
  // Phases
  'skills/bridge/orchestrator/phases/00-initialization.md',
  'skills/bridge/orchestrator/phases/00b-codebase-analysis.md',
  'skills/bridge/orchestrator/phases/01-translate.md',
  'skills/bridge/orchestrator/phases/02-research.md',
  'skills/bridge/orchestrator/phases/03-architect.md',
  'skills/bridge/orchestrator/phases/04-build.md',
  'skills/bridge/orchestrator/phases/05-validate.md',
  // Key modules (sampled, not exhaustive)
  'skills/bridge/orchestrator/modules/pixel-agent.md',
  'skills/bridge/orchestrator/modules/context-budget.md',
  'skills/bridge/orchestrator/modules/pipeline-state.md',
  'skills/bridge/orchestrator/modules/discovery-interview.md',
  // Key references
  'skills/bridge/references/ojo-critico.md',
  'skills/bridge/references/prompt-defense-baseline.md',
  'skills/bridge/references/rubric-scoring.md',
  // Repo top-level
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'VERSION',
  'package.json'
];

const missing = [];
for (const rel of REQUIRED) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) missing.push(rel);
}

if (missing.length === 0) {
  process.stdout.write(`[test-required-files] OK (${REQUIRED.length} files present)\n`);
  process.exit(0);
}

process.stderr.write('[test-required-files] FAIL -- missing:\n');
for (const m of missing) process.stderr.write('  ' + m + '\n');
process.exit(1);
