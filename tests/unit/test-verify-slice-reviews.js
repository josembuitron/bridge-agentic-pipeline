#!/usr/bin/env node
/*
 * Unit test for skills/bridge/orchestrator/scripts/verify-slice-reviews.js
 *
 * The script is the deterministic enforcement behind BRIDGE's per-slice independent-review
 * guarantee: as a Stop hook it must exit 2 (block) when a slice that requires review is
 * complete without a valid independent review, and exit 0 (allow) otherwise. These cases pin
 * that behavior so the guarantee cannot silently regress.
 *
 * No external deps: builds fixture pipelines in a temp dir and runs the script with spawnSync
 * (safe array args, no shell), passing stdin via the `input` option so it never blocks.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.resolve(__dirname, '..', '..', 'skills', 'bridge', 'orchestrator', 'scripts', 'verify-slice-reviews.js');

let failures = 0;
let count = 0;

function tmpProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-review-test-'));
  fs.mkdirSync(path.join(dir, 'pipeline'), { recursive: true });
  return dir;
}
function writeLedger(dir, obj) {
  fs.writeFileSync(path.join(dir, 'pipeline', '04-slice-ledger.json'),
    typeof obj === 'string' ? obj : JSON.stringify(obj));
}
function writeManifest(dir, text) {
  fs.writeFileSync(path.join(dir, 'pipeline', '04-build-manifest.md'), text);
}
function writeArtifact(dir, name, content) {
  fs.writeFileSync(path.join(dir, 'pipeline', name), content);
}
function run(dir, mode, stdin) {
  const res = spawnSync('node', [SCRIPT, dir], {
    input: stdin || '',
    env: Object.assign({}, process.env, { BRIDGE_REVIEW_HOOK_MODE: mode || 'enforce' }),
    encoding: 'utf8',
  });
  return res.status;
}
function check(name, got, want) {
  count++;
  if (got === want) {
    console.log('  ok  - ' + name + ' (exit ' + got + ')');
  } else {
    failures++;
    console.log('  FAIL - ' + name + ' (expected ' + want + ', got ' + got + ')');
  }
}

const GOOD_ARTIFACT =
  '# Independent Review: spec-db-slice-7\nBuilder-Agent: spec-db\nReviewer-Agent: reviewer-1\nVerdict: PASS\n';
const REF_LEDGER = {
  slices: [{
    slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete',
    review: { reviewer_agent: 'reviewer-1', verdict: 'PASS', artifact: 'pipeline/04-spec-db-slice-7-review.md' },
  }],
};

// 1. No ledger -> allow (not a build, or build not started).
{
  const d = tmpProject();
  fs.rmSync(path.join(d, 'pipeline', '04-slice-ledger.json'), { force: true });
  check('no ledger -> allow', run(d), 0);
}
// 2. Valid full review (artifact present, reviewer != builder, PASS) -> allow.
{
  const d = tmpProject();
  writeLedger(d, REF_LEDGER);
  writeArtifact(d, '04-spec-db-slice-7-review.md', GOOD_ARTIFACT);
  check('valid review -> allow', run(d), 0);
}
// 3. High-risk complete, no review -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete', review: null }] });
  check('high-risk no review -> block', run(d), 2);
}
// 4. Self-review (reviewer == builder, case-insensitive) -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'Spec-DB', status: 'complete', review: { reviewer_agent: 'spec-db', verdict: 'PASS', artifact: 'pipeline/04-spec-db-slice-7-review.md' } }] });
  writeArtifact(d, '04-spec-db-slice-7-review.md', GOOD_ARTIFACT);
  check('self-review (case-insensitive) -> block', run(d), 2);
}
// 5. Artifact exists but is a hollow stub (no fields) -> block.
{
  const d = tmpProject();
  writeLedger(d, REF_LEDGER);
  writeArtifact(d, '04-spec-db-slice-7-review.md', 'just notes, no structured fields');
  check('hollow artifact stub -> block', run(d), 2);
}
// 6. Artifact reviewer does not match ledger reviewer -> block.
{
  const d = tmpProject();
  writeLedger(d, REF_LEDGER);
  writeArtifact(d, '04-spec-db-slice-7-review.md', '# R\nReviewer-Agent: someone-else\nVerdict: PASS\n');
  check('artifact reviewer mismatch -> block', run(d), 2);
}
// 7. Missing review artifact file -> block.
{
  const d = tmpProject();
  writeLedger(d, REF_LEDGER); // artifact file intentionally not written
  check('missing artifact file -> block', run(d), 2);
}
// 8. FAIL-SAFE: risk field missing entirely -> treated as needing review -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-3', builder_agent: 'spec-x', status: 'complete', review: null }] });
  check('missing risk (failsafe) -> block', run(d), 2);
}
// 9. FAIL-SAFE: risk typo (not "standard") -> treated as needing review -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-3', risk: 'hihg', builder_agent: 'spec-x', status: 'complete', review: null }] });
  check('typo risk (failsafe) -> block', run(d), 2);
}
// 10. Explicit "standard" risk with benign files, no review -> allow (verifiably low-risk).
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-ui-slice-2', risk: 'standard', builder_agent: 'spec-ui', status: 'complete', files: ['src/ui/button.tsx', 'src/ui/styles.css'], review: null }] });
  check('standard + benign files -> allow', run(d), 0);
}
// 11. Manifest completes a slice absent from the ledger -> block (ledger desync / dodge).
{
  const d = tmpProject();
  writeLedger(d, { slices: [] });
  writeManifest(d, 'BRIDGE_SLICE_COMPLETE: spec-db-slice-7');
  check('manifest orphan -> block', run(d), 2);
}
// 12. Dodge: manifest complete + ledger "pending" + high-risk + no review -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'pending', review: null }] });
  writeManifest(d, 'BRIDGE_SLICE_COMPLETE: spec-db-slice-7');
  check('dodge via pending status -> block', run(d), 2);
}
// 13. Trailing punctuation on the manifest token still matches the ledger id -> allow.
{
  const d = tmpProject();
  writeLedger(d, REF_LEDGER);
  writeArtifact(d, '04-spec-db-slice-7-review.md', GOOD_ARTIFACT);
  writeManifest(d, 'Done: BRIDGE_SLICE_COMPLETE: spec-db-slice-7.');
  check('trailing-punctuation token -> allow', run(d), 0);
}
// 14. Malformed ledger -> fail open (allow), never wedge on a transient/corrupt read.
{
  const d = tmpProject();
  writeLedger(d, '{ not valid json ');
  check('malformed ledger -> allow (fail open)', run(d), 0);
}
// 15. BOM-encoded ledger still parses and enforces -> block.
{
  const d = tmpProject();
  fs.writeFileSync(path.join(d, 'pipeline', '04-slice-ledger.json'),
    '﻿' + JSON.stringify({ slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete', review: null }] }));
  check('BOM-encoded ledger -> block', run(d), 2);
}
// 16. Warn mode downgrades a real violation to allow.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete', review: null }] });
  check('warn mode -> allow', run(d, 'warn'), 0);
}
// 17. Loop guard: stop_hook_active re-entry downgrades a violation to allow.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete', review: null }] });
  check('loop-guard (stop_hook_active) -> allow', run(d, 'enforce', JSON.stringify({ stop_hook_active: true })), 0);
}

// 18. Non-string reviewer_agent (e.g. a number) must NOT throw/fail-open -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'high', builder_agent: 'spec-db', status: 'complete', review: { reviewer_agent: 123, verdict: 'PASS', artifact: 'pipeline/04-spec-db-slice-7-review.md' } }] });
  writeArtifact(d, '04-spec-db-slice-7-review.md', GOOD_ARTIFACT);
  check('numeric reviewer_agent -> block (no fail-open)', run(d), 2);
}
// 19. Non-string risk (array) must NOT opt out of review -> block (only string "standard" opts out).
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: ['standard'], builder_agent: 'spec-db', status: 'complete', review: null }] });
  check('array risk ["standard"] -> block (failsafe)', run(d), 2);
}
// 20. Numeric risk -> block (failsafe).
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 0, builder_agent: 'spec-db', status: 'complete', review: null }] });
  check('numeric risk -> block (failsafe)', run(d), 2);
}

// 21. Content override: labeled "standard" but a file touches migrations, no review -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-4', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: ['src/util.ts', 'migrations/002_add_column.sql'], review: null }] });
  check('standard label + high-risk file -> block (content override)', run(d), 2);
}
// 22. Content override with a valid review present -> allow.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-db-slice-7', risk: 'standard', builder_agent: 'spec-db', status: 'complete', files: ['src/db/schema.ts'], review: { reviewer_agent: 'reviewer-1', verdict: 'PASS', artifact: 'pipeline/04-spec-db-slice-7-review.md' } }] });
  writeArtifact(d, '04-spec-db-slice-7-review.md', GOOD_ARTIFACT);
  check('standard + high-risk file + valid review -> allow', run(d), 0);
}
// 23. "standard" but no files recorded -> cannot verify low risk -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-5', risk: 'standard', builder_agent: 'spec-x', status: 'complete', review: null }] });
  check('standard + no files -> block (cannot verify)', run(d), 2);
}
// 24. Azure DevOps / IaC file is high-risk even when labeled standard -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-infra-slice-1', risk: 'standard', builder_agent: 'spec-infra', status: 'complete', files: ['azure-pipelines.yml', 'infra/main.bicep'], review: null }] });
  check('standard + azure-pipelines/bicep -> block (content override)', run(d), 2);
}

// 25. C1 regression: "standard" with a junk files element (null) must NOT count as listing
// files -> a placeholder cannot buy the exemption -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-6', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: [null], review: null }] });
  check('standard + [null] files -> block (no placeholder exemption)', run(d), 2);
}
// 26. C1 regression: "standard" with only an empty/whitespace string path -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-7', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: ['   '], review: null }] });
  check('standard + ["   "] files -> block (no real path)', run(d), 2);
}
// 27. W2 coverage: dotfile secret (.env) is high-risk even when labeled standard -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-8', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: ['config/.env.production'], review: null }] });
  check('standard + .env -> block (content override)', run(d), 2);
}
// 28. W2 coverage: compound IaC extension (.tf.json) and identity (iam) -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-9', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: ['infra/network.tf.json', 'iam/policy.json'], review: null }] });
  check('standard + .tf.json/iam -> block (content override)', run(d), 2);
}
// 29. W2 coverage: database config and ssh key by name -> block.
{
  const d = tmpProject();
  writeLedger(d, { slices: [{ slice_id: 'spec-x-slice-10', risk: 'standard', builder_agent: 'spec-x', status: 'complete', files: ['config/database.yml', 'deploy/id_rsa'], review: null }] });
  check('standard + database/id_rsa -> block (content override)', run(d), 2);
}

console.log('\n[test-verify-slice-reviews] ' + (count - failures) + '/' + count + ' passed.');
if (failures > 0) process.exit(1);
