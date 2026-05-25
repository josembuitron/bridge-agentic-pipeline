#!/usr/bin/env node

// Verifies that every modules/*.md and references/*.md referenced from
// orchestrator/core.md actually exists on disk.

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CORE = path.join(ROOT, 'skills', 'bridge', 'orchestrator', 'core.md');
const ORCH_DIR = path.join(ROOT, 'skills', 'bridge', 'orchestrator');
const SKILL_DIR = path.join(ROOT, 'skills', 'bridge');

if (!fs.existsSync(CORE)) {
  process.stderr.write('[test-module-references] FAIL -- core.md not found at ' + CORE + '\n');
  process.exit(1);
}

const text = fs.readFileSync(CORE, 'utf8');

// Patterns we expect references in core.md to follow.
// modules/foo.md (relative to orchestrator/)
// references/foo.md (relative to skills/bridge/)
const lines = text.split('\n');

// Build a set of "conditional" refs that the test should tolerate even if missing.
// A reference is conditional if its line contains "CONDITIONAL" or "Conditional Modules".
// This supports fork-specific modules that the public repo intentionally omits.
const conditionalRefs = new Set();
const allModuleRefs = new Set();
const allRefRefs = new Set();

let inConditionalSection = false;
for (const line of lines) {
  if (/^###\s+Conditional Modules/.test(line)) inConditionalSection = true;
  else if (/^###\s+/.test(line)) inConditionalSection = false;

  const modMatch = line.match(/`(modules\/[a-zA-Z0-9_\-./]+\.md)`/);
  if (modMatch) {
    allModuleRefs.add(modMatch[1]);
    if (inConditionalSection || /CONDITIONAL/i.test(line)) {
      conditionalRefs.add(modMatch[1]);
    }
  }
  const refMatch = line.match(/`(references\/[a-zA-Z0-9_\-./]+\.md)`/);
  if (refMatch) {
    allRefRefs.add(refMatch[1]);
    if (/CONDITIONAL/i.test(line)) {
      conditionalRefs.add(refMatch[1]);
    }
  }
}

const missing = [];

for (const rel of allModuleRefs) {
  if (conditionalRefs.has(rel)) continue;
  const abs = path.join(ORCH_DIR, rel);
  if (!fs.existsSync(abs)) missing.push('orchestrator/' + rel);
}

for (const rel of allRefRefs) {
  if (conditionalRefs.has(rel)) continue;
  const abs = path.join(SKILL_DIR, rel);
  if (!fs.existsSync(abs)) missing.push('skills/bridge/' + rel);
}

if (missing.length === 0) {
  const total = allModuleRefs.size + allRefRefs.size;
  const condCount = conditionalRefs.size;
  process.stdout.write(`[test-module-references] OK (${total} references resolve, ${condCount} conditional skipped)\n`);
  process.exit(0);
}

process.stderr.write('[test-module-references] FAIL -- broken references in core.md:\n');
for (const m of missing) process.stderr.write('  ' + m + '\n');
process.exit(1);
