# SBOM Generator Module

Generates a Software Bill of Materials (SBOM) in CycloneDX JSON format for every BRIDGE project. The SBOM captures all tools, libraries, and dependencies used during pipeline execution.

**Audit requirement:** Executive Order 14028 (US), EU Cyber Resilience Act, and enterprise compliance programs increasingly require SBOMs for all software deliverables.

---

## When to Generate

| Event | Action |
|-------|--------|
| Phase 0 completes (after tool install) | Generate initial SBOM with all installed tools |
| Phase 4 build installs new deps | Update SBOM with project-specific dependencies |
| Phase 5 finalization | Finalize SBOM, include in tooling manifest |

---

## Generation Protocol

### Step 1: Collect Installed Package Data

Run these commands and capture output:

```bash
# pip packages (JSON format with versions)
pip list --format=json 2>/dev/null > /tmp/bridge-pip-list.json

# npm global packages (JSON format with versions)
npm list -g --depth=0 --json 2>/dev/null > /tmp/bridge-npm-list.json

# npm project-local packages (if src/package.json exists)
if [ -f "src/package.json" ]; then
  cd src && npm list --depth=0 --json 2>/dev/null > /tmp/bridge-npm-project.json && cd ..
fi
```

### Step 2: Generate CycloneDX SBOM

The orchestrator writes `pipeline/sbom.json` using this structure:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:{generated-uuid}",
  "version": 1,
  "metadata": {
    "timestamp": "{ISO-8601}",
    "tools": [{
      "vendor": "BRIDGE Pipeline",
      "name": "sbom-generator",
      "version": "1.0"
    }],
    "component": {
      "type": "application",
      "name": "{project-name}",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "{package-name}",
      "version": "{version}",
      "purl": "pkg:pypi/{name}@{version}",
      "scope": "required",
      "properties": [{
        "name": "bridge:phase",
        "value": "0"
      }, {
        "name": "bridge:install-method",
        "value": "pip"
      }]
    }
  ]
}
```

**Package URL (purl) format:**
- pip packages: `pkg:pypi/{name}@{version}`
- npm packages: `pkg:npm/{name}@{version}` (scoped: `pkg:npm/%40scope/{name}@{version}`)
- system tools: `pkg:generic/{name}@{version}`

### Step 3: Enrich with License Data

For each component, attempt to capture license info:

```bash
# pip: license from pip show
pip show {package} 2>/dev/null | grep -i "license:"

# npm: license from npm view
npm view {package} license 2>/dev/null
```

Add to component: `"licenses": [{"license": {"id": "{SPDX-ID}"}}]`

If license cannot be determined: `"licenses": [{"license": {"name": "UNKNOWN"}}]`

---

## SBOM Update Protocol (Phase 4)

When a Phase 4 specialist installs a new dependency (detected via PostToolUse on Bash containing `npm install` or `pip install`):

1. Read current `pipeline/sbom.json`
2. Parse the install command to extract package name and version
3. Add new component entry with `"bridge:phase": "4"` and `"bridge:specialist": "{agent-name}"`
4. Write updated SBOM

The orchestrator performs this update at each Phase 4 approval gate (batch update, not per-install).

---

## SBOM Finalization (Phase 5)

At Phase 5 Step 5.7 (before deliverable generation):

1. Read final `pipeline/sbom.json`
2. Add total component count to `pipeline/tooling-manifest.md` under a new `## SBOM Summary` section:
   ```markdown
   ## SBOM Summary
   - Total components: {N}
   - pip packages: {X}
   - npm packages (global): {Y}
   - npm packages (project): {Z}
   - System tools: {W}
   - Licenses: {list unique SPDX IDs}
   - SBOM file: pipeline/sbom.json (CycloneDX 1.5)
   ```
3. If the project produces client deliverables: mention SBOM availability in the deliverable cover page

---

## Validation

The Phase 5 Validator checks:
- `pipeline/sbom.json` exists and is valid JSON
- Every tool listed in `pipeline/tooling-manifest.md` has a corresponding SBOM component
- No components have `"version": "unknown"` (warning, not blocking)
- Component count matches reality: `pip list --format=json | wc -l` ~ sbom pip count (within 20% tolerance for filtering)

---

## Client Deliverable Integration

The SBOM is an INTERNAL artifact (`pipeline/sbom.json`). It is NOT included in `deliverables/` by default.

**Exception:** If the client has compliance requirements (SOC 2, HIPAA, GDPR, FedRAMP) noted in `pipeline/00-constraints.md`, the orchestrator asks:

```
Present via AskUserQuestion:

"This project has compliance requirements ({requirement}).
 An SBOM (Software Bill of Materials) documents all software used.
 
 Options:
   a) Include SBOM in client deliverables
   b) Keep SBOM internal only (available on request)

Default if no response: (b) Internal only
```
