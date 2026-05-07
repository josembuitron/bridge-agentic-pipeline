# Hyperframes Renderer — Branded Visuals & Hero Slides

Hyperframes renders HTML + CSS + GSAP compositions to high-quality MP4 video AND PNG/JPEG stills programmatically. It is **MANDATORY** for branded visual assets and PowerPoint hero slides in BRIDGE.

## When Hyperframes is REQUIRED (not optional)

| Use Case | Phase | Output |
|----------|-------|--------|
| **Hero/cover slides** for PPTX | 5 (deliverables) | PNG 1920x1080 @2x -- pptxgenjs |
| **Executive summary infographic** | 5 (deliverables) | PNG embedded in HTML report |
| **Data visualization stills** for slides | 5 (deliverables) | PNG charts/comparisons for PPTX |
| **Branded visual assets** (timeline, comparison tables) | 5 (deliverables) | PNG for PPTX + HTML |
| **Animated explainer video** (optional) | 5 (deliverables) | MP4 for HTML report or LinkedIn outreach |
| **Fallback #3 for architecture diagrams** | 3 (architect) | PNG/SVG when diagrams Python + D2 fail |

## When Hyperframes is NOT used

| Use Case | Correct Tool | Why |
|----------|-------------|-----|
| Cloud architecture diagrams with vendor icons | `diagrams` Python | 700+ built-in icons, Graphviz auto-layout |
| Non-cloud architecture diagrams | D2 | Better nested containers, auto-layout |
| Interactive HTML reports | Native HTML + Chart.js | Needs interactivity (tabs, zoom, dark mode) |
| Editable slide text/tables | pptxgenjs | Client needs to edit text in PowerPoint |
| Markdown-embedded diagrams | Mermaid | Always-available, portable fallback |

---

## Installation

Hyperframes is invoked via `npx` -- no global install required. The CLI auto-fetches the latest version on first use:

```bash
# Verify Node 22+
node --version

# Validate Hyperframes is reachable
npx hyperframes@latest --version
```

**Detection** (Phase 0 uses detect_tool fallback chain -- see `phases/00-initialization.md`):
```bash
detect_tool "HYPERFRAMES" \
  "npx --no-install hyperframes --version" \
  "npx hyperframes@latest --version"
```

**System requirements**: Node.js 22+, FFmpeg in PATH. Chrome Headless Shell is auto-downloaded on first render (~150MB, cached globally).

The first `npx hyperframes init` call also installs the official Hyperframes skills locally -- no extra step needed.

---

## CRITICAL: No Local Installations in client folders

```
NEVER run npm install inside clients/ folders.
NEVER create node_modules/ inside clients/ folders.
NEVER create package.json inside clients/ folders.

Hyperframes runs via npx. If Node is on PATH, it works from any directory.
All temp project structures go in the system temp directory.
```

---

## Temp Project Setup (for renders that need a project structure)

When a Hyperframes project structure is needed (compositions, assets, multi-scene), create it in the **system temp directory**:

```
TEMP DIR (auto-cleaned):
  Linux/Mac:  /tmp/hyperframes-{project-slug}/
  Windows:    %TEMP%/hyperframes-{project-slug}/  (Git Bash: /tmp/hyperframes-{project-slug}/)

Structure:
  /tmp/hyperframes-{project-slug}/
    compositions/
      hero-slide/
        index.html        <- composition entry
        styles.css
        animations.js     <- GSAP timelines
      infographic/
        index.html
        styles.css
      comparison-table/
        index.html
        styles.css
      arch-diagram/
        index.html
        styles.css
    public/
      logos/
      images/
    brand-tokens.css      <- Auto-generated from brand-config.json
    hyperframes.json      <- project config (resolution, fps, output dir)
```

**No NODE_PATH needed** -- Hyperframes runs in its own subprocess via npx; client scripts do not `require()` it.

Output images go DIRECTLY to `{project-path}/deliverables/images/` -- only the final PNGs/MP4s touch the client folder, never node_modules or source files.

After rendering completes: delete `/tmp/hyperframes-{project-slug}/` entirely.

---

## Cover Image Strategy

Hyperframes is excellent for branded graphics, data visualizations, and UI mockups. It is NOT ideal for photorealistic imagery of physical objects (casino chips, medical equipment, factories, etc.).

### Decision tree for cover images:

```
Does the cover need industry-specific physical imagery?
  |
  +-- YES (casino, healthcare, manufacturing, etc.)
  |   `-- Use the Image Selection Protocol:
  |       1. Generate ONE Hyperframes candidate with concrete industry elements
  |       2. Search 5 stock photos via Playwright (Unsplash/Pexels/Google Images)
  |       3. Compare candidates, pick the best
  |       4. Total time: < 5 minutes
  |
  `-- NO (abstract branded, data viz, tech patterns)
      `-- Hyperframes only. Use brand colors + geometric/tech elements.
```

### Image Selection Protocol (< 5 minutes total)

1. **Hyperframes candidate**: Render ONE image with a detailed, industry-specific composition
   - Include concrete visual elements (NOT "abstract connected dots")
   - Use brand colors as accent
   - Save to `/tmp/hyperframes-{slug}/candidate-hyperframes.png`

2. **Stock photo search**: Use Playwright browser to search Unsplash/Pexels/Google Images
   - Use specific search terms from the content strategy visual brief
   - Browse thumbnails via `browser_snapshot` (DO NOT download everything)
   - Select 2-3 best candidates by visual inspection
   - Download only those 2-3 to `/tmp/bridge-images/`
   - **Maximum 5 downloads total** -- if you cannot find something good in 5 images, use Hyperframes

3. **Compare and select**:
   - View each candidate using Read tool
   - Score: industry relevance (0-10), visual quality (0-10), brand fit (0-10)
   - Pick the winner, copy to `deliverables/images/cover.png`
   - Delete `/tmp/bridge-images/` and temp Hyperframes files

4. **If stock photo wins**: that is fine. Use the right tool for the job.

### Mandatory Self-Evaluation

After rendering ANY Hyperframes image, the agent MUST:
1. View the output using Read tool
2. Ask: "Does this look like what the client's industry is about?"
3. Ask: "Would a design director approve this?"
4. If NO to either: regenerate with improved composition (max 1 retry)
5. If still NO after retry: fall back to stock photo search

### Brand Integration

Read `brand-assets/brand-config.json` and generate `brand-tokens.css`:

```css
/* Auto-generated from brand-config.json */
:root {
  --brand-primary: #002B5C;
  --brand-secondary: #00A3E0;
  --brand-accent: #F7941D;
  --brand-background: #FFFFFF;
  --brand-text: #333333;
  --brand-font-heading: 'Segoe UI', sans-serif;
  --brand-font-body: 'Segoe UI', sans-serif;
}
```

---

## Composition Templates

### 1. Hero Slide (MANDATORY for every PPTX)

`/tmp/hyperframes-{slug}/compositions/hero-slide/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../../brand-tokens.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="stage"
       data-composition-id="hero-slide"
       data-start="0"
       data-duration="5"
       data-width="1920"
       data-height="1080">
    <div class="hero-bg"></div>
    <img class="client-logo" src="../../public/logos/client-logo.png" alt="">
    <h1 class="hero-title" data-start="0" data-duration="5">{{title}}</h1>
    <p class="hero-subtitle" data-start="0.3" data-duration="4.7">{{subtitle}}</p>
    <p class="hero-date">{{date}}</p>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script src="animations.js"></script>
</body>
</html>
```

`styles.css`:
```css
.hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
}
.client-logo { position: absolute; top: 80px; left: 80px; width: 200px; }
.hero-title {
  position: absolute; top: 40%; left: 80px; right: 80px;
  font-size: 72px; font-family: var(--brand-font-heading);
  color: white; font-weight: 700; line-height: 1.1; margin: 0;
}
.hero-subtitle {
  position: absolute; top: calc(40% + 100px); left: 80px;
  font-size: 32px; color: rgba(255,255,255,0.85);
  font-family: var(--brand-font-body);
}
.hero-date {
  position: absolute; bottom: 40px; right: 80px;
  font-size: 20px; color: rgba(255,255,255,0.6);
}
```

`animations.js` (paused timeline, deterministic seeking -- see the `gsap` skill):
```javascript
const tl = gsap.timeline({ paused: true });
tl.from('.hero-title', { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' }, 0)
  .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, 0.3);
window.__hfGSAP = tl;
```

### 2. Executive Summary Infographic (MANDATORY for HTML report)

```html
<div id="stage" data-composition-id="infographic" data-width="1920" data-height="1080">
  <h2 class="infographic-title">Executive Summary</h2>
  <div class="metric-grid">
    <!-- Stat card x N, populated from project data via template engine -->
  </div>
  <p class="summary">{{summary}}</p>
</div>
```

Use the `data-chart` block from the Hyperframes catalog (`npx hyperframes add data-chart`) for animated metric grids and series visualizations.

### 3. Comparison Table Visual (MANDATORY for effort estimation slides)

```html
<div id="stage" data-composition-id="comparison-table" data-width="1920" data-height="1080">
  <div class="scenario-grid">
    <div class="scenario-card">{{scenarios.0}}</div>
    <div class="scenario-card highlighted">
      {{scenarios.1}}<span class="badge">Recommended</span>
    </div>
    <div class="scenario-card">{{scenarios.2}}</div>
  </div>
</div>
```

---

## Rendering Pipeline

The deliverable generator agent invokes Hyperframes via the CLI -- no programmatic `require()` needed:

### Single composition -- PNG still

```bash
cd /tmp/hyperframes-{slug}
npx hyperframes render compositions/hero-slide/index.html \
  --still 0 \
  --scale 2 \
  --output {project-path}/deliverables/images/hero-slide.png
```

### Multi-composition batch script

```bash
# /tmp/hyperframes-{slug}/render-all.sh
#!/bin/bash
set -e

OUTPUT_DIR="$1"  # e.g., {project-path}/deliverables/images
mkdir -p "$OUTPUT_DIR"

for comp in hero-slide infographic comparison-table arch-diagram; do
  npx hyperframes render "compositions/$comp/index.html" \
    --still 0 \
    --scale 2 \
    --output "$OUTPUT_DIR/${comp}.png"
  echo "Rendered: $OUTPUT_DIR/${comp}.png"
done
```

### Programmatic (for direct pptxgenjs integration)

```javascript
// /tmp/hyperframes-{slug}/render-and-pack.js
const { execSync } = require('child_process');
const fs = require('fs');

async function renderAndPack(projectData, projectPath) {
  const tmpDir = __dirname;
  const outputDir = `${projectPath}/deliverables/images`;
  fs.mkdirSync(outputDir, { recursive: true });

  const compositions = ['hero-slide', 'infographic', 'comparison-table'];
  for (const comp of compositions) {
    execSync(
      `npx hyperframes render compositions/${comp}/index.html --still 0 --scale 2 --output ${outputDir}/${comp}.png`,
      { cwd: tmpDir, stdio: 'inherit' }
    );
  }

  return {
    hero: fs.readFileSync(`${outputDir}/hero-slide.png`),
    infographic: fs.readFileSync(`${outputDir}/infographic.png`),
    comparisonTable: fs.readFileSync(`${outputDir}/comparison-table.png`),
  };
}

module.exports = { renderAndPack };
```

### Buffer mode for pptxgenjs

```javascript
const { renderAndPack } = require('./render-and-pack');
const buffers = await renderAndPack(projectData, projectPath);

slide.addImage({
  data: `image/png;base64,${buffers.hero.toString('base64')}`,
  x: 0, y: 0, w: '100%', h: '100%'
});
slide.addText(editableTitle, { x: 1, y: 3, fontSize: 36, color: 'FFFFFF' });
```

---

## Integration with PPTX Generation (MANDATORY)

The `generate-pptx.js` script MUST use Hyperframes for these slide types:

| Slide | Hyperframes Image | pptxgenjs Overlay |
|-------|---------------|-------------------|
| **Cover/Hero** | Full-bleed branded background | Project title, date (editable) |
| **Architecture Overview** | SVG from `diagrams` Python (NOT Hyperframes) | Section title (editable) |
| **Executive Summary** | Infographic background | Key highlights (editable) |
| **Effort Comparison** | Visual comparison chart | Scenario labels (editable) |
| **Timeline** | Timeline graphic | Milestone names (editable) |
| **Thank You / Next Steps** | Branded closing background | Contact info (editable) |

**Pattern**: Hyperframes generates the **visual layer** (background, graphics, data viz). pptxgenjs adds the **text layer** on top (editable by client). This gives beautiful visuals AND client editability.

---

## As Architecture Diagram Fallback (#3 in chain)

When `diagrams` Python AND D2 are both unavailable, Hyperframes renders architecture diagrams using HTML+SVG:

```html
<!-- /tmp/hyperframes-{slug}/compositions/arch-diagram/index.html -->
<div id="stage" data-composition-id="arch-diagram" data-width="1920" data-height="1080">
  <h1 class="arch-title">{{title}}</h1>
  <svg class="arch-canvas" viewBox="0 0 1800 900">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
              markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
      </marker>
    </defs>
    <!-- Connections (under boxes) -->
    {{#each connections}}
    <line x1="{{from.x}}" y1="{{from.y}}" x2="{{to.x}}" y2="{{to.y}}"
          stroke="#999" stroke-width="2" marker-end="url(#arrow)" />
    {{/each}}
    <!-- Components -->
    {{#each components}}
    <g transform="translate({{x}}, {{y}})">
      <rect width="120" height="80" rx="8" fill="white"
            stroke="var(--brand-primary)" stroke-width="2"/>
      {{#if logo}}
      <image href="public/logos/{{logo}}" x="30" y="5" width="60" height="40"/>
      {{/if}}
      <text x="60" y="70" text-anchor="middle" font-size="12" fill="#333">{{name}}</text>
    </g>
    {{/each}}
  </svg>
</div>
```

The agent populates the template with project-specific components/connections. Render once via `npx hyperframes render --still 0`.

**Note**: This is inferior to `diagrams` Python for cloud architecture (no auto-layout, no built-in icons). Use ONLY as fallback #3 when diagrams and D2 are both unavailable.

---

## Rendering Commands

### CLI (for manual testing)
```bash
npx hyperframes render compositions/hero-slide/index.html \
  --still 0 --scale 2 \
  --output deliverables/images/hero-slide.png
```

### Multi-scene MP4 (when video output is desired)
```bash
npx hyperframes render compositions/explainer/index.html \
  --output deliverables/videos/explainer.mp4 \
  --fps 30
```

### Programmatic (for pipeline automation)
```bash
node scripts/render-hyperframes.js
```

---

## Error Handling

Hyperframes failures MUST NOT block the pipeline:

```
If Hyperframes render fails:
  1. Log warning: "Hyperframes render failed for {composition}: {error}"
  2. For hero slides     -> pptxgenjs generates plain branded slide (solid color + text)
  3. For infographics    -> skip, HTML report uses text-based summary instead
  4. For arch diagrams   -> fall through to Excalidraw MCP or Mermaid
  5. Continue pipeline -- Hyperframes is enhancement, not gate
```

---

## Dependencies

```json
{
  "hyperframes_stack": {
    "packages": "via npx hyperframes@latest (no global install)",
    "runtime": "Node.js 22+",
    "system": "FFmpeg in PATH; Chrome Headless Shell (auto-downloaded, ~150MB cached)",
    "disk": "~150MB cached (Chrome only -- Hyperframes itself runs from npx cache)"
  }
}
```

---

## Skills auto-loaded

When the agent uses Hyperframes, it should also activate the official skill set on demand:

| Skill | When to invoke |
|-------|---------------|
| `hyperframes` | Composition authoring (any HTML composition) |
| `hyperframes-cli` | CLI dev loop (init, lint, preview, render) |
| `hyperframes-media` | TTS / Whisper transcription / background removal |
| `hyperframes-registry` | `npx hyperframes add <block>` for catalog blocks (data-chart, social overlays, shader transitions) |
| `gsap` | Animation timelines (most compositions) |
| `css-animations` | Pure-CSS animation when GSAP is overkill |
| `tailwind` | If using `npx hyperframes init --tailwind` |
| `lottie` / `three` / `animejs` / `waapi` | Specialized animation runtimes when a composition requires them |
| `hyperframes-helper` | Level 3 talking-head video productions, 16 lint gotchas, 10 motion-graphics recipes (chroma key, D3 globe, pulse borders, liquid glass, etc.) |
| `website-to-hyperframes` | When source is an existing webpage to capture as still or video |
| `remotion-to-hyperframes` | When source is a legacy Remotion (TSX) composition that must be migrated (defensive skill -- no Remotion install required) |
