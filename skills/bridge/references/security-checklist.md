# BRIDGE Security Checklist

This checklist MUST be consulted at two points in every pipeline run:
1. **Phase 0** (initialization) -- verify security infrastructure is in place
2. **Phase 5** (validation) -- verify all security controls were applied

Additionally, this checklist MUST be reviewed before any modification to BRIDGE itself (new modules, new tools, new integrations) to ensure the change does not regress security posture.

---

## Phase 0 Checklist (Before Pipeline Starts)

### Supply Chain
- [ ] `bridge-tool-versions.json` exists and is current (< 90 days since last update)
- [ ] WARN-02 (Tool Installation Security) prompt was presented to user
- [ ] WARN-03 (Version Strategy) prompt was presented to user
- [ ] Supply chain gate module ran pre-install scans for any new packages
- [ ] SBOM generated at `pipeline/sbom.json` after tool installation

### Configuration
- [ ] `pipeline/config.json` has `security_gate: "blocking"` (default)
- [ ] Harness hooks mode documented (off/warn/enforce)
- [ ] `pipeline/security-events.json` initialized (or temp file for Phase 0)

### Taint Tracking
- [ ] Tool risk matrix loaded (taint sources identified: WebFetch, crawl4ai, Playwright)
- [ ] All agents have taint protocol in their prompts

---

## Phase 5 Checklist (Before Delivery)

### SBOM
- [ ] `pipeline/sbom.json` is complete and matches tooling manifest
- [ ] All Phase 4 installed packages are included in SBOM
- [ ] License data captured for all components (UNKNOWN flagged)

### Security Scanning
- [ ] SAST scan completed (semgrep or equivalent)
- [ ] Supply chain risk audit completed (supply-chain-risk-auditor skill)
- [ ] Secrets scan completed (gitguardian or grep-based)
- [ ] All CRITICAL findings resolved or explicitly accepted with documented reason

### Audit Trail
- [ ] `pipeline/security-events.json` contains all phase events
- [ ] `pipeline/approval-log.json` contains all gate decisions
- [ ] Risk overrides documented with user reason

### Client Deliverables
- [ ] No `[EXTERNAL-UNVERIFIED]` tags in deliverables/ (transformed per POLICY-01)
- [ ] No agent/skill/pipeline references in deliverables/ (sanitization checklist)
- [ ] SVGs stripped of script tags (POLICY-02)
- [ ] SBOM available if client has compliance requirements

---

## Change Review Checklist (Before Modifying BRIDGE)

When adding a new module, tool, integration, or changing existing behavior:

### New Tool or Dependency
- [ ] Added to `bridge-tool-versions.json` with pinned version
- [ ] Risk assessment completed (using tool-risk-matrix.md categories)
- [ ] Added to SBOM generation protocol
- [ ] Supply chain gate knows how to scan it
- [ ] Documented in `modules/available-plugins.md`

### New External Integration (MCP, API, web service)
- [ ] Taint classification assigned (LOW/MEDIUM/HIGH)
- [ ] Data flow documented (what data leaves the system, where does it go)
- [ ] Authentication method documented
- [ ] Added to tool risk matrix

### New Module or Phase Change
- [ ] Security implications analyzed (new attack surface?)
- [ ] Existing hooks still cover the new code paths
- [ ] Taint tracking still works (no new untracked taint sources)
- [ ] AI-SAFE2 alignment reviewed (which pillar does this touch?)

### Prompt or Instruction Change
- [ ] Injection resistance considered (could tainted content influence this instruction?)
- [ ] Zero Assumptions Rule still enforced
- [ ] Agent tool permissions unchanged (or explicitly updated in tool matrix)

---

## Quarterly Review

Every 90 days (or after a security incident), review:
- [ ] All pinned versions in `bridge-tool-versions.json` -- update to latest patched
- [ ] All known CVEs in dependencies -- check for new disclosures
- [ ] AI-SAFE2 framework -- check for new version or controls
- [ ] Hook effectiveness -- review security-events.json across recent projects
- [ ] New attack vectors against agentic systems -- review OWASP LLM Top 10 updates
