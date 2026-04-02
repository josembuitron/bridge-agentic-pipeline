# Pixelmatch -- CLI Reference

Pixel-level image comparison for visual regression testing. ~150 lines, zero dependencies.

## Installation

```bash
npm install -g pixelmatch
```

## CLI Usage

```bash
# Compare two images, output diff
pixelmatch baseline.png current.png diff.png [threshold] [includeAA]

# Example: strict comparison (threshold 0.1 = 10% tolerance per pixel)
pixelmatch screenshots/baseline.png screenshots/current.png screenshots/diff.png 0.1

# Lenient comparison (threshold 0.3)
pixelmatch expected.png actual.png diff.png 0.3
```

### Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `image1.png` | YES | -- | Baseline (expected) screenshot |
| `image2.png` | YES | -- | Current (actual) screenshot |
| `diff.png` | NO | -- | Output diff image (red = different pixels) |
| `threshold` | NO | `0.1` | Per-pixel color distance threshold (0 = exact, 1 = any) |
| `includeAA` | NO | `false` | Include anti-aliased pixels in comparison |

### Exit codes

- `0` -- images match (within threshold)
- `1` -- images differ

### Output

Returns the **number of different pixels** to stdout. Example:

```bash
$ pixelmatch baseline.png current.png diff.png 0.1
42
```

42 pixels differ. The `diff.png` shows them highlighted in red.

## Programmatic Usage (Node.js)

For more control in test scripts:

```javascript
import { readFileSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const img1 = PNG.sync.read(readFileSync('baseline.png'));
const img2 = PNG.sync.read(readFileSync('current.png'));
const { width, height } = img1;
const diff = new PNG({ width, height });

const numDiffPixels = pixelmatch(
  img1.data, img2.data, diff.data,
  width, height,
  { threshold: 0.1 }
);

console.log(`Different pixels: ${numDiffPixels}`);
```

### Options (programmatic)

| Option | Default | Description |
|--------|---------|-------------|
| `threshold` | `0.1` | Color distance (0-1). Lower = stricter |
| `includeAA` | `false` | Detect and skip anti-aliased pixels |
| `alpha` | `0.1` | Opacity of original image in diff output |
| `aaColor` | `[255,255,0]` | Color for anti-aliased pixels in diff |
| `diffColor` | `[255,0,0]` | Color for different pixels in diff |
| `diffColorAlt` | `null` | Alternative diff color (for dark backgrounds) |
| `diffMask` | `false` | Output only diff pixels (no original) |

## Visual Regression Workflow

### 1. Capture baseline screenshots

```bash
# Using Playwright (recommended for web apps)
npx playwright screenshot --full-page http://localhost:3000 screenshots/baseline.png
```

### 2. After code changes, capture current

```bash
npx playwright screenshot --full-page http://localhost:3000 screenshots/current.png
```

### 3. Compare

```bash
DIFF_PIXELS=$(pixelmatch screenshots/baseline.png screenshots/current.png screenshots/diff.png 0.1)
echo "Different pixels: $DIFF_PIXELS"

# Threshold for BRIDGE: more than 100 different pixels = visual regression
if [ "$DIFF_PIXELS" -gt 100 ]; then
  echo "VISUAL REGRESSION DETECTED: $DIFF_PIXELS pixels changed"
  exit 1
fi
```

### 4. Update baseline (if changes are intentional)

```bash
cp screenshots/current.png screenshots/baseline.png
```

## When BRIDGE Should Use Pixelmatch

- **Phase 4** when `config.workflow.visual_regression = true`
- After frontend specialist completes a slice with UI changes
- Compare against baseline screenshots captured before the slice
- Threshold: > 100 different pixels at 0.1 tolerance = WARNING
- Always generate `diff.png` for human review at approval gate

## BRIDGE Integration Command

```bash
# Phase 4 visual regression check (after frontend slice)
pixelmatch screenshots/baseline-{page}.png screenshots/current-{page}.png screenshots/diff-{page}.png 0.1
```

Present diff image at the approval gate for human review. Never auto-fail on visual differences -- they may be intentional.
