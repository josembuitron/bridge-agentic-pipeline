# Supply Chain Gate Module

Pre-installation security scanning for all pip and npm packages. Runs BEFORE packages are installed, closing the temporal gap identified in CRIT-02.

**Problem solved:** Without this gate, packages execute during installation (pip setup.py, npm postinstall scripts) before any security scan runs. A malicious package compromises the system the moment it installs.

---

## When It Runs

| Trigger | Action |
|---------|--------|
| Phase 0 Step 0.0c (before auto-install) | Scan all missing tools before batch install |
| Phase 4 (specialist requests new package) | Scan before the specialist's install command runs |

---

## Pre-Install Scan Protocol

### For pip packages

Before running `pip install {package}`:

```bash
# Step 1: Check PyPI metadata WITHOUT installing
pip index versions {package} 2>/dev/null | head -5

# Step 2: Run pip-audit on the package (if pip-audit is available)
pip-audit --desc --fix --dry-run -r <(echo "{package}=={version}") 2>/dev/null

# Step 3: Check package age and download stats (heuristic)
python3 -c "
import urllib.request, json
url = 'https://pypi.org/pypi/{package}/json'
try:
    data = json.loads(urllib.request.urlopen(url, timeout=10).read())
    info = data['info']
    print(f'name={info[\"name\"]}')
    print(f'version={info[\"version\"]}')
    print(f'author={info.get(\"author\", \"UNKNOWN\")}')
    print(f'license={info.get(\"license\", \"UNKNOWN\")}')
    print(f'home_page={info.get(\"home_page\", \"NONE\")}')
    # Check for typosquatting indicators
    if info.get('summary','') == '' and info.get('description','') == '':
        print('WARNING: empty_description')
    releases = data.get('releases', {})
    if len(releases) <= 1:
        print('WARNING: single_release')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null
```

### For npm packages

Before running `npm install -g {package}`:

```bash
# Step 1: Check npm registry metadata WITHOUT installing
npm view {package} name version author license repository.url 2>/dev/null

# Step 2: Run npm audit on the package (dry-run)
npm audit --registry=https://registry.npmjs.org --json 2>/dev/null | head -50

# Step 3: Check package signals
npm view {package} time 2>/dev/null | tail -3
```

---

## Risk Scoring

After collecting metadata, score each package:

| Signal | Score | Why |
|--------|-------|-----|
| Known CVE (CRITICAL/HIGH) | BLOCK | Active vulnerability |
| Known CVE (MEDIUM/LOW) | +3 | Manageable risk |
| Package < 30 days old | +5 | Too new to trust |
| < 100 weekly downloads | +4 | Low adoption |
| Empty description on registry | +3 | Typosquatting indicator |
| Single release ever | +3 | Possibly abandoned or fake |
| No homepage or repo URL | +2 | Reduced traceability |
| Author email is free provider | +1 | Lower trust signal |
| In bridge-tool-versions.json | -5 | Known and tested |
| > 1M weekly downloads | -3 | High adoption |
| Maintained by known org | -3 | Organizational trust |

**Thresholds:**
- Score <= 0: AUTO-APPROVE (safe, well-known package)
- Score 1-5: APPROVE WITH NOTE (log to security events)
- Score 6-9: WARN USER (present findings, ask to proceed)
- Score >= 10: BLOCK (require explicit override with documented reason)

---

## Decision Flow

```
Package to install
  |
  v
Check bridge-tool-versions.json
  |
  ├── Listed with matching version? --> AUTO-APPROVE (known good)
  |
  ├── Listed but different version? --> WARN: version mismatch
  |
  └── Not listed? --> Run full pre-install scan
        |
        v
      Score package
        |
        ├── Score <= 0 --> AUTO-APPROVE
        ├── Score 1-5 --> Log + install
        ├── Score 6-9 --> Present to user via AskUserQuestion:
        |     "Package {name} has risk indicators:
        |      {list indicators}
        |      Options:
        |        a) Install anyway (I trust this package)
        |        b) Skip this package
        |        c) Show me more details
        |      Default: (b) Skip"
        |
        └── Score >= 10 --> BLOCK:
              "Package {name} is BLOCKED due to high risk:
               {list indicators}
               To override: explicitly confirm with reason
               (logged to security-events.json)"
```

---

## Phase 4 Integration

When a Phase 4 specialist agent includes `pip install` or `npm install` in a Bash command:

1. The orchestrator intercepts (via the specialist's output review, NOT via a hook -- hooks cannot parse install intent reliably)
2. Extract package name and version from the command
3. Check against `pipeline/sbom.json` -- if already present, skip scan
4. If new package: run pre-install scan protocol
5. If approved: allow install, update SBOM
6. If blocked: inform specialist, suggest alternatives from `pipeline/02-research-report.md`

**This does NOT use a PreToolUse hook** because:
- Hook scripts cannot reliably parse complex bash commands
- The orchestrator has full context (research report, solution proposal) to evaluate alternatives
- False positives on hooks would break the build flow

Instead, the orchestrator reviews each specialist's work at the slice approval gate and checks for unapproved dependencies.

---

## Escape Hatch

If the supply chain gate blocks a package that is genuinely needed:

1. User explicitly approves with reason
2. Reason is logged to `pipeline/security-events.json`:
   ```json
   {
     "event": "supply_chain_override",
     "package": "{name}@{version}",
     "risk_score": 12,
     "indicators": ["single_release", "low_downloads"],
     "user_reason": "{reason}",
     "timestamp": "{ISO-8601}"
   }
   ```
3. Package is added to a `pipeline/approved-overrides.json` so it is not re-blocked on resume

---

## Limitations

- **Cannot scan compiled extensions** -- pip packages with C extensions execute code during install. The scan checks metadata only, not compiled content.
- **Registry availability** -- if PyPI/npm is unreachable, the scan degrades to checking `bridge-tool-versions.json` only.
- **Zero-day attacks** -- if a known-good package is compromised between version pin updates, this gate will not catch it until the CVE is published.

These are inherent limitations of pre-install scanning. For defense-in-depth, combine with:
- Version pinning (`bridge-tool-versions.json`)
- Post-install SAST scanning (Phase 5 `supply-chain-risk-auditor` skill)
- SBOM tracking for rapid incident response
