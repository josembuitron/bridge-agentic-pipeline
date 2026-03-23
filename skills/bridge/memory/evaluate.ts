/**
 * BRIDGE Karpathy Loop — Post-project evaluation script
 *
 * Correlates CT decisions with quality outcomes across projects.
 * Runs after Phase 5 delivery: node evaluate.ts <project-path>
 *
 * This is REAL computation, not LLM prompting — it processes JSON
 * files from multiple projects and detects statistical patterns.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

// --- Types ---

interface Decision {
  phase: number | string;
  agent: string;
  decision: string;
  ct_framework_used: string;
  confidence: number;
  human_override: boolean;
  human_choice?: string;
}

interface DecisionLog {
  project: string;
  decisions: Decision[];
}

interface QualityScore {
  overall: number;
  requirements_coverage: number;
  test_pass_rate: number;
  security_score: number;
  code_quality: number;
  documentation: number;
}

interface Correlation {
  ct_framework: string;
  phase: number | string;
  confidence: number;
  outcome_score: number;
  delta: number;
}

interface Experiment {
  date: string;
  project: string;
  methodology_selected: string;
  quality_score: QualityScore;
  decisions: Decision[];
  correlations: Correlation[];
  human_override_rate: number;
}

interface Insight {
  pattern: string;
  evidence_count: number;
  first_seen: string;
  last_seen: string;
  recommendation: string;
  confidence: number;
}

// --- Main ---

function evaluate(projectPath: string): void {
  const basePath = resolve(projectPath);
  const memoryPath = resolve(__dirname);

  // 1. Read project artifacts
  const decisionsPath = join(basePath, 'pipeline', 'ct-decisions.json');
  if (!existsSync(decisionsPath)) {
    console.log('No ct-decisions.json found — skipping evaluation.');
    console.log('This project predates CT integration or had no decisions logged.');
    return;
  }

  const decisionLog: DecisionLog = JSON.parse(readFileSync(decisionsPath, 'utf-8'));
  const decisions = decisionLog.decisions || [];

  const qualityPath = join(basePath, 'pipeline', 'quality-score.json');
  const qualityScore: QualityScore = existsSync(qualityPath)
    ? JSON.parse(readFileSync(qualityPath, 'utf-8'))
    : { overall: 0, requirements_coverage: 0, test_pass_rate: 0, security_score: 0, code_quality: 0, documentation: 0 };

  const methodologyPath = join(basePath, 'pipeline', '03c-methodology-selection.md');
  let methodology = 'default-fdd';
  if (existsSync(methodologyPath)) {
    const content = readFileSync(methodologyPath, 'utf-8');
    const match = content.match(/Selected methodology.*?:\s*(.*)/i)
      || content.match(/primary.*?:\s*"?([^"\n]+)/i);
    if (match) methodology = match[1].trim();
  }

  // 2. Calculate correlations
  const correlations: Correlation[] = decisions.map(d => ({
    ct_framework: d.ct_framework_used,
    phase: d.phase,
    confidence: d.confidence,
    outcome_score: qualityScore.overall,
    delta: d.confidence - qualityScore.overall
  }));

  // 3. Calculate human override stats
  const overrideCount = decisions.filter(d => d.human_override).length;
  const humanOverrideRate = decisions.length > 0 ? overrideCount / decisions.length : 0;

  // 4. Build experiment
  const experiment: Experiment = {
    date: new Date().toISOString().split('T')[0],
    project: extractProjectSlug(basePath),
    methodology_selected: methodology,
    quality_score: qualityScore,
    decisions,
    correlations,
    human_override_rate: humanOverrideRate
  };

  // 5. Save experiment
  const experimentsDir = join(memoryPath, 'experiments');
  if (!existsSync(experimentsDir)) {
    mkdirSync(experimentsDir, { recursive: true });
  }
  const safeProject = experiment.project.replace(/[/\\]/g, '-');
  const expFile = join(experimentsDir, `${experiment.date}-${safeProject}.json`);
  writeFileSync(expFile, JSON.stringify(experiment, null, 2));
  console.log(`Experiment saved: ${expFile}`);

  // 6. Update insights
  const insightCount = updateInsights(memoryPath);
  console.log(`Insights updated: ${insightCount} patterns found.`);
}

function updateInsights(memoryPath: string): number {
  const insightsPath = join(memoryPath, 'insights.json');
  const expDir = join(memoryPath, 'experiments');

  if (!existsSync(expDir)) return 0;

  const expFiles = readdirSync(expDir).filter(f => f.endsWith('.json'));
  const allExperiments: Experiment[] = expFiles.map(f =>
    JSON.parse(readFileSync(join(expDir, f), 'utf-8'))
  );

  if (allExperiments.length < 3) {
    console.log(`Only ${allExperiments.length} experiments — need 3+ for pattern detection.`);
    writeFileSync(insightsPath, JSON.stringify([], null, 2));
    return 0;
  }

  const newInsights: Insight[] = [];

  // Pattern 1: CT framework effectiveness per phase
  const frameworkPhaseMap = new Map<string, number[]>();
  for (const exp of allExperiments) {
    for (const corr of exp.correlations) {
      const key = `${corr.ct_framework}@phase-${corr.phase}`;
      if (!frameworkPhaseMap.has(key)) frameworkPhaseMap.set(key, []);
      frameworkPhaseMap.get(key)!.push(corr.outcome_score);
    }
  }

  for (const [key, scores] of frameworkPhaseMap) {
    if (scores.length >= 3) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const [framework, phase] = key.split('@');
      newInsights.push({
        pattern: `${framework} at ${phase} correlates with avg quality score ${avg.toFixed(2)}`,
        evidence_count: scores.length,
        first_seen: allExperiments[0].date,
        last_seen: allExperiments[allExperiments.length - 1].date,
        recommendation: avg > 0.8
          ? `Keep using ${framework} at ${phase} — consistently effective`
          : `Consider alternatives to ${framework} at ${phase} — below 0.8 threshold`,
        confidence: Math.min(scores.length / 10, 1)
      });
    }
  }

  // Pattern 2: Methodology effectiveness
  const methodologyScores = new Map<string, number[]>();
  for (const exp of allExperiments) {
    const m = exp.methodology_selected;
    if (!methodologyScores.has(m)) methodologyScores.set(m, []);
    methodologyScores.get(m)!.push(exp.quality_score.overall);
  }

  for (const [methodology, scores] of methodologyScores) {
    if (scores.length >= 3) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      newInsights.push({
        pattern: `Methodology "${methodology}" produces avg quality score ${avg.toFixed(2)}`,
        evidence_count: scores.length,
        first_seen: allExperiments[0].date,
        last_seen: allExperiments[allExperiments.length - 1].date,
        recommendation: avg > 0.8
          ? `"${methodology}" is effective — recommend for similar projects`
          : `Reconsider "${methodology}" — avg below 0.8`,
        confidence: Math.min(scores.length / 10, 1)
      });
    }
  }

  // Pattern 3: Human override correlation
  const highOverrideExps = allExperiments.filter(e => e.human_override_rate > 0.3);
  const lowOverrideExps = allExperiments.filter(e => e.human_override_rate <= 0.3);

  if (highOverrideExps.length >= 2 && lowOverrideExps.length >= 2) {
    const highAvg = highOverrideExps.reduce((s, e) => s + e.quality_score.overall, 0) / highOverrideExps.length;
    const lowAvg = lowOverrideExps.reduce((s, e) => s + e.quality_score.overall, 0) / lowOverrideExps.length;

    if (Math.abs(highAvg - lowAvg) > 0.05) {
      newInsights.push({
        pattern: `Projects with high human override rate (>30%): avg score ${highAvg.toFixed(2)} vs low override: ${lowAvg.toFixed(2)}`,
        evidence_count: allExperiments.length,
        first_seen: allExperiments[0].date,
        last_seen: allExperiments[allExperiments.length - 1].date,
        recommendation: highAvg > lowAvg
          ? 'Human overrides correlate with better outcomes — CT may be miscalibrated'
          : 'CT recommendations outperform human overrides — system is well-calibrated',
        confidence: Math.min(allExperiments.length / 10, 1)
      });
    }
  }

  writeFileSync(insightsPath, JSON.stringify(newInsights, null, 2));
  return newInsights.length;
}

function extractProjectSlug(basePath: string): string {
  const parts = basePath.replace(/\\/g, '/').split('/');
  const clientIdx = parts.indexOf('clients');
  if (clientIdx >= 0 && parts.length > clientIdx + 2) {
    return `${parts[clientIdx + 1]}/${parts[clientIdx + 2]}`;
  }
  return parts.slice(-2).join('/');
}

// --- CLI ---
const projectPath = process.argv[2];
if (!projectPath) {
  console.error('Usage: npx tsx evaluate.ts <project-path>');
  console.error('Example: npx tsx evaluate.ts clients/acme/dashboard-project');
  process.exit(1);
}

evaluate(projectPath);
