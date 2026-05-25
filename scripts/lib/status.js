'use strict';

// bridge status: read state.json for projects under clients/
// Honors --markdown to emit a markdown table.

const fs = require('fs');
const path = require('path');

function findStateFiles(root) {
  const results = [];
  const clientsDir = path.join(root, 'clients');
  if (!fs.existsSync(clientsDir)) return results;
  const clients = fs.readdirSync(clientsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const c of clients) {
    const projects = fs.readdirSync(path.join(clientsDir, c.name), { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const p of projects) {
      const statePath = path.join(clientsDir, c.name, p.name, 'pipeline', 'state.json');
      if (fs.existsSync(statePath)) {
        results.push({ client: c.name, project: p.name, statePath });
      }
    }
  }
  return results;
}

function readState(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function emitText(states) {
  if (!states.length) {
    process.stdout.write('No projects found under clients/.\n');
    return;
  }
  for (const s of states) {
    const data = readState(s.statePath);
    process.stdout.write(`${s.client} / ${s.project}\n`);
    if (!data) {
      process.stdout.write('  state.json: unreadable\n\n');
      continue;
    }
    process.stdout.write(`  current_phase: ${data.current_phase || 'unknown'}\n`);
    process.stdout.write(`  last_checkpoint: ${data.last_checkpoint || 'n/a'}\n`);
    if (Array.isArray(data.pending_approvals) && data.pending_approvals.length) {
      process.stdout.write(`  pending_approvals: ${data.pending_approvals.join(', ')}\n`);
    }
    process.stdout.write('\n');
  }
}

function emitMarkdown(states) {
  process.stdout.write('# BRIDGE Status\n\n');
  if (!states.length) {
    process.stdout.write('No projects found.\n');
    return;
  }
  process.stdout.write('| Client | Project | Phase | Last Checkpoint | Pending Approvals |\n');
  process.stdout.write('|---|---|---|---|---|\n');
  for (const s of states) {
    const data = readState(s.statePath) || {};
    const phase = data.current_phase || 'unknown';
    const ckpt = data.last_checkpoint || 'n/a';
    const pend = Array.isArray(data.pending_approvals) ? data.pending_approvals.join(', ') : '';
    process.stdout.write(`| ${s.client} | ${s.project} | ${phase} | ${ckpt} | ${pend} |\n`);
  }
}

async function runStatus({ argv } = { argv: [] }) {
  const wantMarkdown = argv.includes('--markdown');
  const explicit = argv.find((a) => !a.startsWith('--'));

  let states;
  if (explicit) {
    const statePath = path.join(explicit, 'pipeline', 'state.json');
    if (!fs.existsSync(statePath)) {
      process.stderr.write(`No state.json under ${statePath}\n`);
      return 1;
    }
    const parts = explicit.split(/[\\/]/);
    const project = parts.pop();
    const client = parts.pop();
    states = [{ client, project, statePath }];
  } else {
    states = findStateFiles(process.cwd());
  }

  if (wantMarkdown) emitMarkdown(states); else emitText(states);
  return 0;
}

module.exports = { runStatus };
