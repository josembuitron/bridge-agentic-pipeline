# Remotion Renderer — Branded Visuals & Hero Slides

Remotion renders React components to high-quality PNG/JPEG images programmatically. It is **MANDATORY** for branded visual assets and PowerPoint hero slides in BRIDGE.

## When Remotion is REQUIRED (not optional)

| Use Case | Phase | Output |
|----------|-------|--------|
| **Hero/cover slides** for PPTX | 5 (deliverables) | PNG 1920x1080 @2x → pptxgenjs |
| **Executive summary infographic** | 5 (deliverables) | PNG embedded in HTML report |
| **Data visualization stills** for slides | 5 (deliverables) | PNG charts/comparisons for PPTX |
| **Branded visual assets** (timeline, comparison tables) | 5 (deliverables) | PNG for PPTX + HTML |
| **Fallback #3 for architecture diagrams** | 3 (architect) | PNG/SVG when diagrams Python + D2 fail |

## When Remotion is NOT used

| Use Case | Correct Tool | Why |
|----------|-------------|-----|
| Cloud architecture diagrams with vendor icons | `diagrams` Python | 700+ built-in icons, Graphviz auto-layout |
| Non-cloud architecture diagrams | D2 | Better nested containers, auto-layout |
| Interactive HTML reports | Native HTML + Chart.js | Needs interactivity (tabs, zoom, dark mode) |
| Editable slide text/tables | pptxgenjs | Client needs to edit text in PowerPoint |
| Markdown-embedded diagrams | Mermaid | Always-available, portable fallback |

---

## Installation

Remotion MUST be installed **GLOBALLY**. NEVER install inside client folders.

```bash
# Global install (one-time)
npm install -g remotion @remotion/cli @remotion/bundler @remotion/renderer
```

**Detection** (Phase 0 uses detect_tool fallback chain — see `phases/00-initialization.md`):
```bash
detect_tool "REMOTION" \
  "npx --no-install remotion --version" \
  "npm list -g @remotion/cli" \
  "npm list -g remotion" \
  "node -e \"require('remotion')\""
```

**System requirements**: Node.js 16+. Chrome Headless Shell is auto-downloaded on first render (~200MB, cached globally).

---

## CRITICAL: No Local Installations

```
NEVER run npm install inside clients/ folders.
NEVER create node_modules/ inside clients/ folders.
NEVER create package.json inside clients/ folders.

Remotion is GLOBAL. If it's installed globally, it works from any directory.
All temp project structures go in the system temp directory.
```

---

## Temp Project Setup (for renders that need a project structure)

When a Remotion project structure is needed (compositions, tsx files), create it in the **system temp directory**:

```
TEMP DIR (auto-cleaned):
  Linux/Mac:  /tmp/remotion-{project-slug}/
  Windows:    %TEMP%/remotion-{project-slug}/  (Git Bash: /tmp/remotion-{project-slug}/)

Structure:
  /tmp/remotion-{project-slug}/
    src/
      index.tsx
      Root.tsx
      components/
        HeroSlide.tsx
        Infographic.tsx
        DataVizStill.tsx
        TimelineGraphic.tsx
        ComparisonTable.tsx
      styles/
        brand.ts          ← Auto-generated from brand-config.json
    public/
      logos/
    tsconfig.json
    remotion.config.ts
```

**NODE_PATH is MANDATORY** in all render scripts:
```javascript
// At the top of EVERY Remotion script:
const path = require('path');
process.env.NODE_PATH = process.env.NPM_GLOBAL_PATH ||
  require('child_process').execSync('npm root -g').toString().trim();
require('module').Module._initPaths();
```

Output images go DIRECTLY to `{project-path}/deliverables/images/` — only the final PNGs touch the client folder, never node_modules or source files.

After rendering completes: delete `/tmp/remotion-{project-slug}/` entirely.

---

## Cover Image Strategy

Remotion is excellent for branded graphics, data visualizations, and UI mockups. It is NOT ideal for photorealistic imagery of physical objects (casino chips, medical equipment, factories, etc.).

### Decision tree for cover images:

```
Does the cover need industry-specific physical imagery?
  │
  ├── YES (casino, healthcare, manufacturing, etc.)
  │   └── Use the Image Selection Protocol:
  │       1. Generate ONE Remotion candidate with concrete industry elements
  │       2. Search 5 stock photos via Playwright (Unsplash/Pexels/Google Images)
  │       3. Compare candidates, pick the best
  │       4. Total time: < 5 minutes
  │
  └── NO (abstract branded, data viz, tech patterns)
      └── Remotion only. Use brand colors + geometric/tech elements.
```

### Image Selection Protocol (< 5 minutes total)

1. **Remotion candidate**: Render ONE image with a detailed, industry-specific prompt
   - Include concrete visual elements (NOT "abstract connected dots")
   - Use brand colors as accent
   - Save to `/tmp/remotion-{slug}/candidate-remotion.png`

2. **Stock photo search**: Use Playwright browser to search Unsplash/Pexels/Google Images
   - Use specific search terms from the content strategy visual brief
   - Browse thumbnails via `browser_snapshot` (DO NOT download everything)
   - Select 2-3 best candidates by visual inspection
   - Download only those 2-3 to `/tmp/bridge-images/`
   - **Maximum 5 downloads total** — if you can't find something good in 5 images, use Remotion

3. **Compare and select**:
   - View each candidate using Read tool
   - Score: industry relevance (0-10), visual quality (0-10), brand fit (0-10)
   - Pick the winner, copy to `deliverables/images/cover.png`
   - Delete `/tmp/bridge-images/` and temp Remotion files

4. **If stock photo wins**: that's fine. Use the right tool for the job.

### Mandatory Self-Evaluation

After rendering ANY Remotion image, the agent MUST:
1. View the output using Read tool
2. Ask: "Does this look like what the client's industry is about?"
3. Ask: "Would a design director approve this?"
4. If NO to either: regenerate with improved prompt (max 1 retry)
5. If still NO after retry: fall back to stock photo search

### Brand Integration

Read `brand-assets/brand-config.json` and generate `remotion/src/styles/brand.ts`:

```typescript
// Auto-generated from brand-config.json
export const brand = {
  colors: {
    primary: '#002B5C',     // from brand-config.json
    secondary: '#00A3E0',
    accent: '#F7941D',
    background: '#FFFFFF',
    text: '#333333',
  },
  fonts: {
    heading: 'Segoe UI',   // from brand-config.json
    body: 'Segoe UI',
  },
  logo: '../public/logos/client-logo.png', // if available
};
```

---

## Composition Templates

### 1. Hero Slide (MANDATORY for every PPTX)

```tsx
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { brand } from '../styles/brand';

interface HeroSlideProps {
  title: string;
  subtitle: string;
  clientLogo?: string;
  date: string;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({ title, subtitle, clientLogo, date }) => (
  <AbsoluteFill style={{
    background: `linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.secondary} 100%)`,
    padding: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }}>
    {clientLogo && (
      <Img src={staticFile(clientLogo)} style={{ width: 200, marginBottom: 40 }} />
    )}
    <h1 style={{
      fontSize: 72,
      color: 'white',
      fontFamily: brand.fonts.heading,
      fontWeight: 700,
      margin: 0,
      lineHeight: 1.1,
    }}>{title}</h1>
    <p style={{
      fontSize: 32,
      color: 'rgba(255,255,255,0.85)',
      fontFamily: brand.fonts.body,
      marginTop: 20,
    }}>{subtitle}</p>
    <p style={{
      fontSize: 20,
      color: 'rgba(255,255,255,0.6)',
      fontFamily: brand.fonts.body,
      position: 'absolute',
      bottom: 40,
      right: 80,
    }}>{date}</p>
  </AbsoluteFill>
);
```

### 2. Executive Summary Infographic (MANDATORY for HTML report)

```tsx
interface InfographicProps {
  projectName: string;
  keyMetrics: { label: string; value: string; icon?: string }[];
  summary: string;
}

// Component renders key metrics in a visually appealing grid
// with brand colors, icons, and clean typography
```

### 3. Comparison Table Visual (MANDATORY for effort estimation slides)

```tsx
interface ComparisonProps {
  scenarios: {
    name: string;
    timeline: string;
    teamSize: string;
    cost: string;
    highlight?: boolean; // recommended scenario
  }[];
}

// Renders side-by-side scenario cards with brand styling
// Highlighted scenario gets accent border and "Recommended" badge
```

---

## Rendering Pipeline (Node.js)

The deliverable generator agent creates the render script in the **temp directory**, with output going to the project's deliverables:

```javascript
// /tmp/remotion-{slug}/render-all.js
// NODE_PATH MUST be set before any Remotion require()
const path = require('path');
process.env.NODE_PATH = process.env.NPM_GLOBAL_PATH ||
  require('child_process').execSync('npm root -g').toString().trim();
require('module').Module._initPaths();

const { bundle } = require('@remotion/bundler');
const { renderStill, selectComposition } = require('@remotion/renderer');
const fs = require('fs');

async function renderAll(projectData, projectPath) {
  // Step 1: Bundle from temp dir (NOT from client folder)
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, 'src/index.tsx'),
  });

  // Step 2: Output goes to the CLIENT project's deliverables/images/
  const outputDir = path.resolve(projectPath, 'deliverables/images');
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 2: Render each composition
  const compositions = [
    {
      id: 'hero-slide',
      output: path.join(outputDir, 'hero-slide.png'),
      props: {
        title: projectData.projectName,
        subtitle: projectData.subtitle,
        date: projectData.date,
      },
    },
    {
      id: 'infographic',
      output: path.join(outputDir, 'executive-infographic.png'),
      props: projectData.infographicData,
    },
    {
      id: 'comparison-table',
      output: path.join(outputDir, 'effort-comparison.png'),
      props: { scenarios: projectData.scenarios },
    },
  ];

  for (const comp of compositions) {
    const composition = await selectComposition({
      serveUrl: bundled,
      id: comp.id,
      inputProps: comp.props,
    });

    await renderStill({
      composition,
      serveUrl: bundled,
      output: comp.output,
      imageFormat: 'png',
      scale: 2, // 2x for crisp slides (3840x2160)
      inputProps: comp.props,
    });

    console.log(`Rendered: ${comp.output}`);
  }

  return compositions.map(c => c.output);
}

  // Step 3: Clean up temp dir after successful render
  console.log('All renders complete. Cleaning temp files...');
  // (orchestrator handles cleanup of /tmp/remotion-{slug}/ after Phase C)

  return compositions.map(c => c.output);
}

// Export for use by deliverable generator
module.exports = { renderAll };
```

### Buffer Mode (for direct pptxgenjs integration)

When generating PPTX, use buffer mode to avoid temp files:

```javascript
const { buffer } = await renderStill({
  composition,
  serveUrl: bundled,
  imageFormat: 'png',
  scale: 2,
  inputProps: heroProps,
});

// Direct to pptxgenjs — no disk write needed
slide.addImage({ data: `image/png;base64,${buffer.toString('base64')}`, x: 0, y: 0, w: '100%', h: '100%' });
slide.addText(editableTitle, { x: 1, y: 3, fontSize: 36, color: 'FFFFFF' });
```

---

## Integration with PPTX Generation (MANDATORY)

The `generate-pptx.js` script MUST use Remotion for these slide types:

| Slide | Remotion Image | pptxgenjs Overlay |
|-------|---------------|-------------------|
| **Cover/Hero** | Full-bleed branded background | Project title, date (editable) |
| **Architecture Overview** | SVG from `diagrams` Python (NOT Remotion) | Section title (editable) |
| **Executive Summary** | Infographic background | Key highlights (editable) |
| **Effort Comparison** | Visual comparison chart | Scenario labels (editable) |
| **Timeline** | Timeline graphic | Milestone names (editable) |
| **Thank You / Next Steps** | Branded closing background | Contact info (editable) |

**Pattern**: Remotion generates the **visual layer** (background, graphics, data viz). pptxgenjs adds the **text layer** on top (editable by client). This gives beautiful visuals AND client editability.

---

## As Architecture Diagram Fallback (#3 in chain)

When `diagrams` Python AND D2 are both unavailable, Remotion renders architecture diagrams using React + SVG:

```tsx
interface ArchDiagramProps {
  components: { name: string; type: string; x: number; y: number; logo?: string }[];
  connections: { from: string; to: string; label?: string }[];
  title: string;
}

export const ArchDiagram: React.FC<ArchDiagramProps> = ({ components, connections, title }) => (
  <AbsoluteFill style={{ background: 'white', padding: 60 }}>
    <h1 style={{ fontSize: 48, textAlign: 'center', fontFamily: brand.fonts.heading }}>
      {title}
    </h1>
    <svg width="100%" height="85%" viewBox="0 0 1800 900">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
                markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
        </marker>
      </defs>
      {connections.map((conn, i) => {
        const from = components.find(c => c.name === conn.from);
        const to = components.find(c => c.name === conn.to);
        if (!from || !to) return null;
        return (
          <g key={i}>
            <line x1={from.x + 60} y1={from.y + 40} x2={to.x} y2={to.y + 40}
                  stroke="#999" strokeWidth={2} markerEnd="url(#arrow)" />
            {conn.label && (
              <text x={(from.x + to.x) / 2 + 30} y={(from.y + to.y) / 2 + 30}
                    fontSize={14} fill="#666" textAnchor="middle">{conn.label}</text>
            )}
          </g>
        );
      })}
      {components.map((comp, i) => (
        <g key={comp.name} transform={`translate(${comp.x}, ${comp.y})`}>
          <rect width={120} height={80} rx={8} fill="white"
                stroke={brand.colors.primary} strokeWidth={2} />
          {comp.logo && (
            <image href={`public/logos/${comp.logo}`} x={30} y={5} width={60} height={40} />
          )}
          <text x={60} y={70} textAnchor="middle" fontSize={12}
                fontFamily={brand.fonts.body} fill={brand.colors.text}>{comp.name}</text>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
```

**Note**: This is inferior to `diagrams` Python for cloud architecture (no auto-layout, no built-in icons). Use ONLY as fallback #3 when diagrams and D2 are both unavailable.

---

## Rendering Commands

### CLI (for manual testing)
```bash
npx remotion still remotion/src/index.tsx hero-slide deliverables/images/hero-slide.png \
  --props='{"title":"Project Name","subtitle":"Solution Proposal","date":"2026-03-24"}' \
  --scale=2 --image-format=png
```

### Programmatic (for pipeline automation)
```bash
node scripts/render-remotion.js
```

---

## Error Handling

Remotion failures MUST NOT block the pipeline:

```
If Remotion render fails:
  1. Log warning: "Remotion render failed for {composition}: {error}"
  2. For hero slides → pptxgenjs generates plain branded slide (solid color + text)
  3. For infographics → skip, HTML report uses text-based summary instead
  4. For arch diagrams → fall through to Excalidraw MCP or Mermaid
  5. Continue pipeline — Remotion is enhancement, not gate
```

---

## Dependencies

```json
{
  "remotion_stack": {
    "packages": ["remotion", "@remotion/bundler", "@remotion/renderer", "@remotion/cli"],
    "runtime": "Node.js 16+",
    "system": "Chrome Headless Shell (auto-downloaded, ~200MB cached)",
    "disk": "~250MB first install, subsequent renders use cache"
  }
}
```
