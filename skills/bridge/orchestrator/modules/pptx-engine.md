# PPTX Engine: Coordinated Multi-Tool Presentation Generation

This module defines how BRIDGE coordinates multiple PPTX tools to produce professional presentations. It replaces ad-hoc tool selection with a deterministic decision tree.

## Available Tools (in order of preference for each task)

| Tool | Best for | Installed as |
|---|---|---|
| **python-pptx** | Editing existing templates, slide manipulation, image embedding | pip: `python-pptx` |
| **pptxgenjs** | Programmatic editable shapes (architecture), charts | npm -g: `pptxgenjs` |
| **document-skills:pptx** | Unpack/edit/pack workflow, thumbnail QA, validation | Anthropic skill (auto-loaded) |
| **html2pptx.js** | High-fidelity HTML-to-PPTX conversion | `~/.claude/skills/office-skills/` |
| **Remotion** | Visual asset generation (backgrounds, mockups, data viz) | npm -g: `remotion` |
| **markitdown** | Read/extract text from existing .pptx | pip: `markitdown` |
| **pandoc** | Last-resort markdown-to-pptx | system: `pandoc` |

**CRITICAL RULE: python-pptx is the MASTER builder for all PPTX assembly. It opens, edits, and saves the final deck. Other tools produce INPUTS (images, individual slides, shapes) that python-pptx integrates.**

---

## Decision Tree: Which Tools to Use

```
Does a brand template exist in brand-assets/templates/*.pptx?
  |
  +-- YES --> Strategy A: Brand Template First
  |
  +-- NO
       |
       Does PresentationGO have layouts matching the deck outline?
         |
         +-- YES --> Strategy B: PresentationGO Hybrid
         |
         +-- NO --> Strategy C: From Scratch
```

---

## Strategy A: Brand Template First (highest quality)

When `brand-assets/templates/presentation.pptx` (or similar) exists:

### Step A1: Analyze brand template
```python
# Read template structure
# python -m markitdown brand-assets/templates/presentation.pptx
# This extracts: slide count, slide types, placeholder positions, color scheme
```

The agent reads the template to understand:
- How many slide layouts are available
- Where placeholders are (title, subtitle, body, image)
- Color scheme and font family
- Logo position

### Step A2: Copy template as base
```bash
cp brand-assets/templates/presentation.pptx /tmp/pptx-build-{slug}/base.pptx
```

NEVER edit the original template. Always work on a copy in /tmp/.

### Step A3: python-pptx edits the base
```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
import json

# Load brand config
with open('brand-assets/brand-config.json') as f:
    brand = json.load(f)

prs = Presentation('/tmp/pptx-build-{slug}/base.pptx')

# Delete slides that don't apply (keep cover, closing)
# Duplicate slide layouts for needed slide count
# Replace placeholder text with actual content
# Replace placeholder images with Remotion-generated PNGs
```

### Step A4: For slides needing PresentationGO layout
When a specific slide type (e.g., "four steps process") benefits from a PresentationGO design:

1. **Search PresentationGO** by EXACT diagram type (via Playwright browser)
2. **Download** the .pptx template (save to /tmp/pptx-build-{slug}/presentationgo/)
3. **Analyze** the downloaded template with markitdown to understand layout
4. **Recreate** the layout shapes in the brand deck using python-pptx:
   ```python
   # Read PresentationGO slide to get shape positions
   pgo = Presentation('/tmp/pptx-build-{slug}/presentationgo/four-steps.pptx')
   ref_slide = pgo.slides[0]  # The slide with the design we want

   # Create new slide in brand deck
   slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank layout

   # Recreate each shape with brand colors
   for shape in ref_slide.shapes:
       if shape.has_text_frame:
           # Copy position, apply brand font/color
           new_shape = slide.shapes.add_textbox(
               shape.left, shape.top, shape.width, shape.height
           )
           new_shape.text_frame.text = actual_content[shape.name]
           # Apply brand typography
       elif shape.shape_type == 1:  # Rectangle
           # Copy position/size, apply brand fill color
           slide.shapes.add_shape(
               shape.auto_shape_type,
               shape.left, shape.top, shape.width, shape.height
           )
   ```

**KEY**: We recreate the LAYOUT (positions, sizes) with BRAND colors. We do NOT copy the XML directly (theme colors are incompatible between templates).

### Step A5: Embed Remotion images
```python
# Cover image
slide = prs.slides[0]
slide.shapes.add_picture(
    'deliverables/images/cover.png',
    Emu(0), Emu(0),
    prs.slide_width, prs.slide_height
)
# Move to back so text is on top
# (python-pptx: reorder XML elements)

# UI Mockups
slide = prs.slides[3]
for i, mock in enumerate(mockup_paths):
    slide.shapes.add_picture(mock, Inches(0.5 + i*3.2), Inches(1.5), Inches(3), Inches(4))
```

### Step A6: Architecture appendix (pptxgenjs editable shapes)
```bash
# Generate architecture slide as separate .pptx
node /tmp/pptx-build-{slug}/generate-arch-shapes.js
# Output: /tmp/pptx-build-{slug}/arch-appendix.pptx (1 slide)
```

Then merge into main deck:
```python
# python-pptx can copy slides between presentations
arch_prs = Presentation('/tmp/pptx-build-{slug}/arch-appendix.pptx')
# Copy shapes from arch slide to a new blank slide in main deck
arch_source = arch_prs.slides[0]
arch_slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
for shape in arch_source.shapes:
    # Copy each shape (position, size, fill, text)
    el = shape._element
    arch_slide.shapes._spTree.append(el)
```

### Step A7: Save and QA
```python
output_path = '{project-path}/deliverables/proposals/{slug}-proposal.pptx'
prs.save(output_path)
```

Then run thumbnail QA:
```bash
# Generate visual grid for agent self-evaluation
python /path/to/document-skills/pptx/scripts/thumbnail.py \
  deliverables/proposals/{slug}-proposal.pptx \
  /tmp/pptx-build-{slug}/thumbnails/
```

Agent views the thumbnail grid to verify:
- Correct slide count
- No blank slides
- Images loaded correctly
- Text readable at slide size

### Step A8: Clean up
```bash
rm -rf /tmp/pptx-build-{slug}/
```

---

## Strategy B: PresentationGO Hybrid (good quality)

When no brand template exists, but PresentationGO has matching layouts:

### Step B1: Create base deck with brand styling
```python
from pptx import Presentation
prs = Presentation()  # Fresh deck

# Set slide dimensions (widescreen 16:9)
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Configure default font and colors from brand-config.json
```

### Step B2: For each slide in the deck outline
```
For each slide:
  1. Search PresentationGO for exact diagram type
  2. If found: download, analyze layout, recreate with python-pptx + brand colors
  3. If not found: create with python-pptx shapes directly
  4. Embed Remotion images where visual assets are needed
```

### Steps B3-B8: Same as Strategy A steps A5-A8

---

## Strategy C: From Scratch (fallback)

When neither brand template nor PresentationGO layouts are suitable:

### Option C1: python-pptx from scratch (preferred)
```python
prs = Presentation()
# Build each slide with shapes, text boxes, images
# Apply brand colors from brand-config.json
# Embed Remotion images for visual impact
```

### Option C2: html2pptx.js (high visual fidelity)
If the design is complex and would benefit from HTML/CSS precision:
```bash
# Agent writes HTML slides (one per file)
# Each slide is a full-page HTML with CSS positioning

# Convert to PPTX
node ~/.claude/skills/office-skills/public/pptx/scripts/html2pptx.js \
  /tmp/pptx-build-{slug}/slides/ \
  deliverables/proposals/{slug}-proposal.pptx
```

### Option C3: pptxgenjs full build (last resort for templates)
```javascript
// Only use when python-pptx is unavailable or failing
// NODE_PATH preamble is MANDATORY
const path = require('path');
process.env.NODE_PATH = process.env.NPM_GLOBAL_PATH ||
  require('child_process').execSync('npm root -g').toString().trim();
require('module').Module._initPaths();

const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
// ... build slides
pptx.writeFile({ fileName: 'deliverables/proposals/{slug}-proposal.pptx' });
```

---

## Tool Coordination Rules

### Rule 1: One master builder per deck
python-pptx assembles the final deck. Other tools produce inputs. NEVER switch master builders mid-generation.

### Rule 2: PresentationGO is REFERENCE, not source
Download PresentationGO templates to understand layout (shape positions, sizes, spacing). Then RECREATE the layout in the brand deck with python-pptx. Do NOT try to XML-merge slides between incompatible templates.

### Rule 3: pptxgenjs is for editable shapes ONLY
Use pptxgenjs exclusively for architecture appendix slides (rounded rectangles, arrows, icons) where client editability of shapes is required. It generates a standalone 1-slide .pptx that gets merged.

### Rule 4: All temp work in /tmp/
```
/tmp/pptx-build-{slug}/
  base.pptx              -- Copy of brand template
  presentationgo/         -- Downloaded PresentationGO templates
  remotion/               -- Remotion render outputs (before copy to deliverables)
  arch-appendix.pptx      -- pptxgenjs architecture slide
  thumbnails/             -- QA grid images
  html-slides/            -- HTML slides for html2pptx (if used)
```

Nothing in `clients/` except the final .pptx in `deliverables/proposals/`.

### Rule 5: Brand colors override PresentationGO colors
When recreating a PresentationGO layout, ALWAYS substitute the PresentationGO colors with brand colors from `brand-config.json`. Keep the POSITIONS, replace the STYLING.

### Rule 6: Visual QA before delivery
After generating the final .pptx:
1. Run `thumbnail.py` to generate slide grid
2. Agent views the grid via Read tool
3. Verify: slide count, images loaded, no blank slides, text readable
4. If issues: fix and regenerate (max 1 retry)

---

## Agent Prompt Fragment

Include this in the prompt of any PPTX-generating agent:

```
## PPTX Generation Protocol

Read `modules/pptx-engine.md` for the full coordinated workflow.

Tool roles:
- python-pptx: MASTER builder (opens/edits/saves the final deck)
- pptxgenjs: ONLY for editable architecture shapes (appendix)
- Remotion: generates PNG images embedded in slides
- PresentationGO: LAYOUT REFERENCE (download, analyze, recreate in python-pptx)
- thumbnail.py: QA grid to verify before delivery

NEVER:
- Install packages in clients/ folders
- Switch tools mid-generation
- Copy PresentationGO XML directly (theme colors break)
- Skip thumbnail QA
- Use pandoc for anything except last-resort fallback

ALWAYS:
- Start from brand template if it exists
- Use /tmp/ for all temp work
- Set NODE_PATH in all Node.js scripts
- Apply brand colors over PresentationGO colors
- View the final thumbnail grid before delivering
```

---

## Fallback Chain

```
Strategy A (brand template + python-pptx)
  |
  fails → Strategy B (PresentationGO + python-pptx)
             |
             fails → Strategy C1 (python-pptx from scratch)
                        |
                        fails → Strategy C2 (html2pptx.js)
                                   |
                                   fails → Strategy C3 (pptxgenjs full build)
                                              |
                                              fails → pandoc (basic markdown to pptx)
```

Each level degrades gracefully. The agent reports which strategy was used in the tooling manifest.
