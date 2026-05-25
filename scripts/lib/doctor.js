'use strict';

// bridge doctor: tool detection
// Returns 0 if all critical tools are present, 1 otherwise.

const { execSync } = require('child_process');

const TOOLS = [
  { name: 'node',     critical: true,  cmd: 'node --version',            hint: 'Install Node.js 18+ from https://nodejs.org' },
  { name: 'python',   critical: true,  cmd: 'python --version',          hint: 'Install Python 3.10+ from https://python.org', fallback: 'python3 --version' },
  { name: 'gh',       critical: true,  cmd: 'gh --version',              hint: 'Install GitHub CLI: brew install gh / winget install GitHub.cli' },
  { name: 'crawl4ai', critical: true,  cmd: 'crwl --version',            hint: 'pip install -U crawl4ai && crawl4ai-setup' },
  { name: 'semgrep',  critical: true,  cmd: 'semgrep --version',         hint: 'pip install semgrep' },
  { name: 'vitest',   critical: false, cmd: 'npx --no-install vitest --version', hint: 'npm install -D vitest (per project)' },
  { name: 'eslint',   critical: false, cmd: 'npx --no-install eslint --version', hint: 'npm install -D eslint (per project)' },
  { name: 'lighthouse', critical: false, cmd: 'lighthouse --version',    hint: 'npm install -g lighthouse' },
  { name: 'pandoc',   critical: false, cmd: 'pandoc --version',          hint: 'Install pandoc from https://pandoc.org/installing.html' }
];

function check(tool) {
  try {
    const out = execSync(tool.cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).toString().trim().split('\n')[0];
    return { ok: true, version: out };
  } catch (_) {
    if (tool.fallback) {
      try {
        const out = execSync(tool.fallback, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).toString().trim().split('\n')[0];
        return { ok: true, version: out };
      } catch (_) {
        // fall through
      }
    }
    return { ok: false, version: null };
  }
}

function pad(s, n) {
  s = String(s);
  if (s.length >= n) return s;
  return s + ' '.repeat(n - s.length);
}

async function runDoctor() {
  process.stdout.write('BRIDGE doctor -- tool detection\n');
  process.stdout.write('=' .repeat(80) + '\n');
  process.stdout.write(pad('Tool', 14) + pad('Status', 10) + pad('Version', 30) + 'Install hint\n');
  process.stdout.write('-'.repeat(80) + '\n');

  let missingCritical = 0;
  let missingOptional = 0;

  for (const tool of TOOLS) {
    const r = check(tool);
    const status = r.ok ? 'OK' : (tool.critical ? 'MISSING*' : 'missing');
    const versionDisplay = r.ok ? r.version.slice(0, 28) : '-';
    const hint = r.ok ? '' : tool.hint;
    process.stdout.write(pad(tool.name, 14) + pad(status, 10) + pad(versionDisplay, 30) + hint + '\n');
    if (!r.ok) {
      if (tool.critical) missingCritical += 1; else missingOptional += 1;
    }
  }

  process.stdout.write('-'.repeat(80) + '\n');
  process.stdout.write(`Critical missing: ${missingCritical}, optional missing: ${missingOptional}\n`);
  if (missingCritical > 0) {
    process.stdout.write('* = critical tool. Install before running the pipeline.\n');
    return 1;
  }
  return 0;
}

module.exports = { runDoctor };
