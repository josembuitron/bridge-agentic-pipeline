#!/usr/bin/env node
/**
 * BRIDGE Pipeline Dashboard Generator
 *
 * Reads state.json and cost-log.json from a project's pipeline/ folder
 * and generates a self-contained HTML dashboard.
 *
 * Zero LLM tokens: this is a deterministic Node.js script.
 * The orchestrator runs it via: node generate-dashboard.js <project-path>
 *
 * Usage: node generate-dashboard.js clients/acme/dashboard-project
 */

const fs = require('fs');
const path = require('path');

const projectPath = process.argv[2];
if (!projectPath) {
  console.error('Usage: node generate-dashboard.js <project-path>');
  process.exit(1);
}

const pipelinePath = path.join(projectPath, 'pipeline');
if (!fs.existsSync(pipelinePath)) {
  console.error('No pipeline/ directory found at:', pipelinePath);
  process.exit(1);
}

// Read available data files
function readJSON(file) {
  const p = path.join(pipelinePath, file);
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) { return null; }
  }
  return null;
}

function readMD(file) {
  const p = path.join(pipelinePath, file);
  if (fs.existsSync(p)) {
    try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; }
  }
  return null;
}

const state = readJSON('state.json') || {};
const config = readJSON('config.json') || {};
const costLog = readJSON('cost-log.json') || { entries: [], total_estimated_usd: 0 };
const qualityScore = readJSON('quality-score.json');

// Detect which phase artifacts exist
const phases = [
  { id: 0, name: 'Initialization', file: '00-constraints.md', bridge: '' },
  { id: 1, name: 'Translate', file: '01-technical-definition.md', bridge: 'B-R-I-D' },
  { id: 2, name: 'Research', file: '02-research-report.md', bridge: 'D validated' },
  { id: 3, name: 'Architect', file: '03-solution-proposal.md', bridge: 'G' },
  { id: 4, name: 'Build', file: '04-build-manifest.md', bridge: 'G' },
  { id: 5, name: 'Validate', file: '05-validation-report.md', bridge: 'E' },
];

phases.forEach(p => {
  p.completed = fs.existsSync(path.join(pipelinePath, p.file));
  p.artifact = p.file;
});

const currentPhase = state.current_phase || phases.filter(p => p.completed).length;
const status = state.status || (currentPhase >= 5 ? 'completed' : 'active');

// Count specialists
const specialistsTotal = state.specialists_total || 0;
const specialistsCompleted = state.specialists_completed || 0;

// Cost summary
const totalCost = costLog.total_estimated_usd ||
  (costLog.entries || []).reduce((sum, e) => sum + (e.estimated_usd || 0), 0);

// Quality score
const qScore = qualityScore ? qualityScore.overall : null;

// Scan for findings
const validationReport = readMD('05-validation-report.md');
const securityAudit = readMD('05c-security-audit.md');
let findingsCount = 0;
let securityVerdict = 'pending';
if (securityAudit) {
  const blocked = securityAudit.match(/BLOCKED/i);
  const secure = securityAudit.match(/SECURE/i);
  securityVerdict = blocked ? 'BLOCKED' : (secure ? 'SECURE' : 'pending');
  const findings = securityAudit.match(/CRITICAL|HIGH|MEDIUM/gi);
  findingsCount = findings ? findings.length : 0;
}

// Generate timestamp
const now = new Date().toISOString().replace('T', ' ').split('.')[0];

// Project name from path
const projectName = path.basename(projectPath);
const clientName = path.basename(path.dirname(projectPath));

// Build HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BRIDGE Dashboard - ${projectName}</title>
<style>
:root{--bg:#0a0f1a;--surface:#1e293b;--surface2:#334155;--text:#e2e8f0;--muted:#94a3b8;--dim:#64748b;--primary:#00BD5B;--blue:#2563eb;--purple:#7c3aed;--red:#dc2626;--amber:#d97706;--cyan:#0891b2}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:var(--bg);color:var(--text);padding:32px;max-width:1000px;margin:0 auto}
h1{font-size:1.8rem;font-weight:900;margin-bottom:4px}
h1 span{color:var(--primary)}
.sub{color:var(--muted);font-size:.9rem;margin-bottom:32px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
.card{background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--surface2)}
.card .label{font-size:.75rem;color:var(--dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.card .value{font-size:1.8rem;font-weight:800}
.card .detail{font-size:.8rem;color:var(--muted);margin-top:4px}
.phases{margin-bottom:32px}
.phases h2{font-size:1.2rem;font-weight:700;margin-bottom:12px;color:var(--primary)}
.phase-row{display:flex;gap:8px;flex-wrap:wrap}
.phase-box{padding:10px 16px;border-radius:8px;font-size:.85rem;font-weight:600;border:1px solid var(--surface2);background:var(--surface);min-width:120px;text-align:center}
.phase-box.done{border-color:var(--primary);background:rgba(0,189,91,.1);color:var(--primary)}
.phase-box.active{border-color:var(--amber);background:rgba(217,119,6,.1);color:var(--amber)}
.phase-box .bridge{font-size:.7rem;color:var(--dim);margin-top:2px}
.costs{margin-bottom:32px}
.costs h2{font-size:1.2rem;font-weight:700;margin-bottom:12px;color:var(--primary)}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{text-align:left;padding:8px;background:var(--surface2);color:var(--primary);font-weight:600}
td{padding:8px;border-bottom:1px solid var(--surface2);color:var(--muted)}
.footer{text-align:center;color:var(--dim);font-size:.8rem;margin-top:32px;padding-top:16px;border-top:1px solid var(--surface2)}
.status-badge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:.75rem;font-weight:700}
.status-active{background:rgba(0,189,91,.15);color:var(--primary)}
.status-completed{background:rgba(0,189,91,.25);color:var(--primary)}
.status-blocked{background:rgba(220,38,38,.2);color:var(--red)}
@media(max-width:700px){.grid{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<h1>BRIDGE <span>Dashboard</span></h1>
<div class="sub">${clientName} / ${projectName} &middot; Generated ${now} &middot; <span class="status-badge status-${status}">${status.toUpperCase()}</span></div>

<div class="grid">
  <div class="card">
    <div class="label">Current phase</div>
    <div class="value">${currentPhase}</div>
    <div class="detail">${phases[Math.min(currentPhase, 5)].name}</div>
  </div>
  <div class="card">
    <div class="label">Specialists</div>
    <div class="value">${specialistsCompleted}/${specialistsTotal || '?'}</div>
    <div class="detail">${state.current_specialist || 'none active'}</div>
  </div>
  <div class="card">
    <div class="label">Est. cost</div>
    <div class="value">$${totalCost.toFixed(2)}</div>
    <div class="detail">${config.budget_cap_usd ? 'Cap: $' + config.budget_cap_usd : 'No budget cap'}</div>
  </div>
  <div class="card">
    <div class="label">Security</div>
    <div class="value" style="color:${securityVerdict === 'SECURE' ? 'var(--primary)' : securityVerdict === 'BLOCKED' ? 'var(--red)' : 'var(--dim)'}">${securityVerdict}</div>
    <div class="detail">${findingsCount} findings</div>
  </div>
</div>

${qScore !== null ? `<div class="grid" style="grid-template-columns:1fr"><div class="card"><div class="label">Quality score</div><div class="value" style="color:${qScore >= 0.8 ? 'var(--primary)' : qScore >= 0.6 ? 'var(--amber)' : 'var(--red)'}">${(qScore * 100).toFixed(0)}%</div><div class="detail">${qScore >= 0.8 ? 'APPROVED' : qScore >= 0.6 ? 'CONDITIONAL' : 'REJECTED'}</div></div></div>` : ''}

<div class="phases">
  <h2>Pipeline progress</h2>
  <div class="phase-row">
    ${phases.map(p => {
      const cls = p.completed ? 'done' : (p.id === currentPhase ? 'active' : '');
      return `<div class="phase-box ${cls}">Phase ${p.id}: ${p.name}${p.bridge ? '<div class="bridge">BRIDGE ' + p.bridge + '</div>' : ''}</div>`;
    }).join('\n    ')}
  </div>
</div>

${(costLog.entries || []).length > 0 ? `
<div class="costs">
  <h2>Cost breakdown</h2>
  <table>
    <tr><th>Agent</th><th>Phase</th><th>Model</th><th>Est. tokens</th><th>Est. USD</th></tr>
    ${(costLog.entries || []).map(e => `<tr><td>${e.agent || 'unknown'}</td><td>${e.phase || '?'}</td><td>${e.model || '?'}</td><td>${(e.estimated_tokens || 0).toLocaleString()}</td><td>$${(e.estimated_usd || 0).toFixed(3)}</td></tr>`).join('\n    ')}
  </table>
</div>
` : ''}

<div class="footer">
  BRIDGE Agentic Pipeline &middot; Dashboard generated by deterministic script (zero LLM tokens)
  <br>Refresh by running: node generate-dashboard.js ${projectPath}
</div>
</body>
</html>`;

// Write dashboard
const outputPath = path.join(projectPath, 'pipeline', 'dashboard.html');
fs.writeFileSync(outputPath, html);
console.log('Dashboard generated:', outputPath);
console.log(`Phase ${currentPhase}/5 | ${specialistsCompleted}/${specialistsTotal} specialists | $${totalCost.toFixed(2)} estimated`);