#!/usr/bin/env node
/*
 * verify-slice-reviews.js - BRIDGE per-slice independent-review enforcement.
 *
 * Purpose: this is the DETERMINISTIC half of BRIDGE's per-slice review guarantee. The skill
 * instructions tell the orchestrator to spawn a fresh reviewer for every high-risk slice, but
 * instructions are advisory - a tired or rationalizing orchestrator could skip them. This
 * script runs as a Stop hook and BLOCKS the pipeline from ending whenever a slice that requires
 * review is effectively complete but was not independently reviewed: no review, a "reviewer"
 * that is the same agent that wrote the code, a non-pass verdict, or a missing/hollow artifact
 * (one whose Reviewer-Agent/Verdict do not match the ledger).
 *
 * Dependency-free (only the fs and path standard modules, no shell, no subprocess).
 *
 * Sources of truth (robust, not fragile markdown structure parsing):
 *   - pipeline/04-slice-ledger.json : structured per-slice record the orchestrator maintains.
 *   - pipeline/04-build-manifest.md : scanned only for the completion token
 *                                     "BRIDGE_SLICE_COMPLETE: <id>", to catch slices marked
 *                                     done in the manifest but hidden from the ledger.
 *   - pipeline/04-<slice_id>-review.md : the artifact, cross-checked for content so a stub fails.
 *
 * Exit codes (Claude Code hook semantics, verified against the official hooks docs):
 *   0 = allow the stop (no violation, warn mode, loop-guard re-entry, or nothing yet)
 *   2 = BLOCK the stop; stderr is fed back to the orchestrator so it must fix the gap
 *
 * Safety posture: fail OPEN (exit 0) only on whole-file transients - no pipeline here, a
 * half-written/unparseable ledger FILE, or a top-level script error - so a guarantee never
 * wedges the user on a transient state or a bug in this file. But a malformed individual slice
 * ENTRY fails CLOSED: it becomes a violation and blocks, so a bad/typed field cannot slip a
 * high-risk slice through. And on ambiguity choose the safe direction: a slice requires review
 * unless EXPLICITLY the string "standard", so a missing/mistyped risk label can never silently
 * disable the gate.
 *
 * Mode: BRIDGE_REVIEW_HOOK_MODE = "enforce" (default) | "warn".
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PASS_VERDICTS = new Set(['PASS', 'PASS-WITH-NOTES']);
const MODE = (process.env.BRIDGE_REVIEW_HOOK_MODE || 'enforce').toLowerCase();

// Read the Stop hook's JSON payload from stdin once: it carries `cwd` and `stop_hook_active`.
// Guard against a TTY (manual run) so we never block waiting for input. Never throw.
function readStdinPayload() {
  try {
    if (process.stdin.isTTY) return {};
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) return {};
    return JSON.parse(raw) || {};
  } catch (_) {
    return {};
  }
}

function norm(v) {
  return (v == null ? '' : String(v)).trim().toLowerCase();
}

// Content-based risk classifier. For the high-risk surfaces enumerated below, the architect's
// "standard" label can only ESCALATE risk, never de-escalate it: a slice whose files match one
// of these patterns needs review regardless of its label, so a mislabel (high -> standard)
// cannot disable the gate for those surfaces. Coverage is keyword-based, so it is PARTIAL by
// design: a high-risk file whose path matches no pattern is not caught -- tune this list to your
// stack. Extension patterns are deliberately NOT end-anchored so compound names (report.sql.gz,
// network.tf.json) still match. It errs toward over-flagging (over-review is the safe direction).
// Matched case-insensitively against each file PATH (not file contents).
const HIGH_RISK_PATTERNS = [
  'migrat', 'schema', 'alembic', 'flyway', 'database', '\\.sql',          // db / migrations
  'auth', 'login', 'session', 'oauth', 'jwt', 'iam', 'rbac', 'permission', 'password', 'credential', // authz / identity
  'crypto', 'secret', 'token', 'vault', '\\.pem', '\\.key', '\\.env', 'id_rsa', // secrets / crypto
  'payment', 'billing', 'invoice', 'charge', 'ledger', 'pricing', 'finance', 'wallet', 'refund', 'payout', // money
  'terraform', '\\.tf', '\\.bicep', 'pulumi', 'cloudformation', 'ansible', 'kubernet', 'k8s', 'helm', 'dockerfile', // infra / IaC
  'azure-pipelines', '\\.github[\\\\/]workflows', 'deploy',               // CI/CD (GitHub Actions + Azure DevOps)
  'etl', 'transform', 'ingest', 'importer', 'exporter',                  // data movement / transformation
];
const HIGH_RISK_RE = new RegExp(HIGH_RISK_PATTERNS.join('|'), 'i');

// Returns the first file path that matches a high-risk pattern, or null if none do.
function firstHighRiskFile(files) {
  if (!Array.isArray(files)) return null;
  for (const f of files) {
    if (typeof f === 'string' && HIGH_RISK_RE.test(f)) return f;
  }
  return null;
}

function allow(message) {
  if (message) process.stderr.write(message + '\n');
  process.exit(0);
}

function block(violations) {
  const lines = [];
  lines.push('[BLOCKED] BRIDGE per-slice review gate: ' + violations.length +
    ' high-risk slice(s) are complete without a valid independent review.');
  lines.push('A slice cannot be self-graded: the reviewer must be a different agent than the');
  lines.push('builder, with verdict PASS or PASS-WITH-NOTES and a review artifact on disk.');
  lines.push('');
  for (const v of violations) lines.push('  - ' + v);
  lines.push('');
  lines.push('Resolve by running the Step 4.3.5 independent review for each slice above and');
  lines.push('updating pipeline/04-slice-ledger.json. To override (records the decision as the');
  lines.push("operator's): set BRIDGE_REVIEW_HOOK_MODE=warn for this run.");
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(2);
}

// Read the review artifact and confirm it is a real review, not a hollow stub: it must carry a
// Reviewer-Agent line matching the ledger reviewer and a Verdict line that is a pass. Returns an
// array of violation strings (empty = OK). Raises the deception bar from "touch a file" to
// "fabricate a structured artifact with matching fields".
function checkArtifact(projectPath, id, artifact, ledgerReviewer) {
  const out = [];
  const artifactPath = path.isAbsolute(artifact) ? artifact : path.join(projectPath, artifact);
  if (!fs.existsSync(artifactPath)) {
    out.push(id + ': review artifact not found on disk (' + artifact + ').');
    return out;
  }
  let text;
  try {
    text = fs.readFileSync(artifactPath, 'utf8');
  } catch (_) {
    out.push(id + ': review artifact could not be read (' + artifact + ').');
    return out;
  }
  const reviewerMatch = text.match(/^[ \t]*Reviewer-Agent:[ \t]*(.+?)[ \t]*$/im);
  const verdictMatch = text.match(/^[ \t]*Verdict:[ \t]*(.+?)[ \t]*$/im);
  if (!reviewerMatch) {
    out.push(id + ': review artifact has no "Reviewer-Agent:" line (looks like a hollow stub).');
  } else if (ledgerReviewer && norm(reviewerMatch[1]) !== norm(ledgerReviewer)) {
    out.push(id + ': artifact Reviewer-Agent "' + reviewerMatch[1].trim() +
      '" does not match ledger reviewer_agent "' + ledgerReviewer + '".');
  }
  if (!verdictMatch) {
    out.push(id + ': review artifact has no "Verdict:" line.');
  } else if (!PASS_VERDICTS.has(verdictMatch[1].trim().toUpperCase())) {
    out.push(id + ': artifact Verdict is "' + verdictMatch[1].trim() + '", not PASS/PASS-WITH-NOTES.');
  }
  return out;
}

function main() {
  const payload = readStdinPayload();
  const stopHookActive = payload && payload.stop_hook_active === true;

  const projectPath = process.argv[2] ||
    (payload && typeof payload.cwd === 'string' ? payload.cwd : process.cwd());
  const pipelineDir = path.join(projectPath, 'pipeline');
  const ledgerPath = path.join(pipelineDir, '04-slice-ledger.json');
  const manifestPath = path.join(pipelineDir, '04-build-manifest.md');

  // Not a BRIDGE run, or the build phase has not produced a ledger yet -> nothing to enforce.
  if (!fs.existsSync(ledgerPath)) allow();

  let ledger;
  try {
    // Strip a UTF-8 BOM if present: some writers (PowerShell Set-Content, certain editors)
    // prepend one, and JSON.parse rejects a leading BOM. Without this, a BOM-encoded ledger
    // would fail to parse and the hook would silently fail OPEN -- i.e., never enforce.
    const rawLedger = fs.readFileSync(ledgerPath, 'utf8').replace(/^\uFEFF/, '');
    ledger = JSON.parse(rawLedger);
  } catch (_) {
    // Half-written or malformed (the orchestrator may be writing it right now). Do not wedge
    // the user on a transient read; the next clean stop will re-check.
    allow('[WARN] BRIDGE review hook: 04-slice-ledger.json is unreadable/incomplete; skipping this check.');
  }

  const slices = Array.isArray(ledger && ledger.slices) ? ledger.slices : [];
  const byId = new Map();
  for (const s of slices) {
    if (s && typeof s.slice_id === 'string') byId.set(s.slice_id.trim(), s);
  }

  // Manifest completion tokens - the authoritative "this slice was declared done" signal.
  // Strip trailing punctuation so "...slice-1." or "(...slice-1)" still match the ledger id.
  const manifestCompleted = new Set();
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const re = /BRIDGE_SLICE_COMPLETE:\s*([^\s\x60'"]+)/g;
    let m;
    while ((m = re.exec(manifest)) !== null) {
      manifestCompleted.add(m[1].replace(/[.,;:)\]}>]+$/, '').trim());
    }
  }

  // A slice is "effectively complete" if the ledger says complete OR the manifest emitted its
  // completion token. Checking both prevents dodging via "complete in manifest, pending in ledger".
  const effectivelyComplete = new Set();
  for (const [id, s] of byId) if (norm(s.status) === 'complete') effectivelyComplete.add(id);
  for (const id of manifestCompleted) effectivelyComplete.add(id);

  const violations = [];

  for (const id of effectivelyComplete) {
    // Evaluate each slice in its own try/catch so a single malformed entry FAILS CLOSED
    // (becomes a violation) rather than throwing up to the top-level handler and failing the
    // whole gate OPEN. All field reads are String()-coerced so a non-string value (e.g. a
    // numeric reviewer_agent) cannot throw and slip a high-risk slice past the gate.
    try {
      const s = byId.get(id);

      // Completed in the manifest but never registered in the enforcement ledger.
      if (!s) {
        violations.push(id + ': completed in build manifest but absent from 04-slice-ledger.json ' +
          '(cannot verify review - register every slice in the ledger at contract time).');
        continue;
      }

      // Decide whether this slice requires an independent review. The label can only ESCALATE
      // (for enumerated high-risk surfaces). A slice is exempt ONLY when ALL of these hold:
      //   - it is EXPLICITLY the string "standard" (missing/typed/numeric risk is never exempt),
      //   - it lists at least one REAL file path (a non-empty string -- junk/empty entries do
      //     not count, so a placeholder cannot buy the downgrade), AND
      //   - none of those paths touch a high-risk surface (content classifier).
      // Anything else requires review.
      const labeledStandard = typeof s.risk === 'string' && s.risk.trim().toLowerCase() === 'standard';
      const allFiles = Array.isArray(s.files) ? s.files : [];
      const realFiles = allFiles.filter(function (f) { return typeof f === 'string' && f.trim().length > 0; });
      const riskyFile = firstHighRiskFile(realFiles);

      if (labeledStandard && !riskyFile && realFiles.length > 0) continue; // verifiably low-risk: exempt

      let reason;
      if (riskyFile) {
        reason = 'high-risk file (' + riskyFile + ') requires review regardless of the "' +
          (s.risk == null ? '' : String(s.risk)) + '" label';
      } else if (!labeledStandard) {
        reason = 'not labeled standard';
      } else {
        reason = 'labeled standard but lists no real file paths, so low risk cannot be verified';
      }

      const review = s.review;
      if (!review || typeof review !== 'object') {
        violations.push(id + ': ' + reason + ', but has no independent review recorded.');
        continue;
      }
      const reviewer = String(review.reviewer_agent == null ? '' : review.reviewer_agent).trim();
      const builder = String(s.builder_agent == null ? '' : s.builder_agent).trim();
      const verdict = String(review.verdict == null ? '' : review.verdict).trim().toUpperCase();

      if (!reviewer) {
        violations.push(id + ': review present but reviewer_agent is empty.');
      } else if (builder && norm(reviewer) === norm(builder)) {
        violations.push(id + ': self-review - reviewer_agent equals builder_agent (' + builder + ').');
      }
      if (!PASS_VERDICTS.has(verdict)) {
        violations.push(id + ': ledger verdict is "' + verdict + '", not PASS or PASS-WITH-NOTES.');
      }
      const artifact = String(review.artifact == null ? '' : review.artifact).trim();
      if (!artifact) {
        violations.push(id + ': review records no artifact path.');
      } else {
        for (const v of checkArtifact(projectPath, id, artifact, reviewer)) violations.push(v);
      }
    } catch (e) {
      // A malformed entry must not slip through: treat the inability to verify as a violation.
      violations.push(id + ': could not be verified (malformed ledger entry: ' +
        (e && e.message ? e.message : e) + ').');
    }
  }

  if (violations.length === 0) allow();

  // Loop guard: if we already blocked once and the orchestrator re-entered the stop without
  // resolving (or this is a context that cannot spawn a reviewer at all), downgrade to a warning
  // so the run is never wedged in an unbreakable Stop loop.
  if (MODE === 'warn' || stopHookActive) {
    const why = stopHookActive ? ' (loop-guard: already blocked once this turn)' : ' (warn mode)';
    allow('[WARN] BRIDGE review hook' + why + ': ' + violations.length +
      ' unreviewed slice(s):\n  - ' + violations.join('\n  - '));
  }
  block(violations);
}

try {
  main();
} catch (err) {
  // Our own bug must never trap the user. Surface it and allow the stop.
  allow('[WARN] BRIDGE review hook errored (allowing stop): ' + (err && err.message ? err.message : err));
}
