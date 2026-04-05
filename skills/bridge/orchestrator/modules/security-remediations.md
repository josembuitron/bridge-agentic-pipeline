# Security Remediations Module

Implements the security audit findings from the OWASP Top 10, ASVS v4.0, WSTG v4.2, and Supply Chain assessments. This module defines WARN prompts, internal policy changes, and documentation of known limitations.

**Audit date:** April 2026
**Report:** BRIDGE-Security-Audit-Report.pdf

---

## User-Facing WARN Prompts

These prompts appear during pipeline execution when a security-relevant decision is needed. The user ALWAYS decides. Each prompt has a safe default so the pipeline continues if the user does not explicitly choose.

### WARN-01: Private/Local URL Access (CRIT-01)
**When:** Phase 2 Research or Phase 4 Build — agent is about to crawl or fetch a URL that resolves to a private IP, localhost, or link-local address.
**Exception:** Phase 5 Adversarial Verifier (Step 5.1e) may access localhost freely — that is its purpose.
**Always block (no user choice):** Cloud metadata endpoints (169.254.169.254, metadata.google.internal, metadata.google.com).

```
Present via AskUserQuestion:

"You are about to access a private or local address: {url}
 This could expose data from your internal network or local machine.

 Options:
   a) Allow this URL (I know what it is)
   b) Skip this URL
   c) Allow all local URLs for this project"

Default if no response: (b) Skip
```

If user chooses (c), set session variable `ALLOW_LOCAL_URLS=true` and do not ask again.

### WARN-02: Tool Installation Security (CRIT-02)
**When:** Phase 0 Step 0.0c, before auto-installing tools.

```
Present via AskUserQuestion:

"BRIDGE will install {N} tools from npm and pip registries.
 You can choose how to handle security:

 Options:
   a) Install now, scan for known issues later (faster -- recommended for most projects)
   b) Check each tool for known vulnerabilities before installing (adds several minutes)

Default if no response: (a) Install now
```

If user chooses (b), run `supply-chain-risk-auditor` skill before each install batch (pip batch, then npm batch). If the auditor flags a CRITICAL CVE, present findings and ask whether to proceed.

### WARN-03: Tool Version Strategy (CRIT-03)
**When:** Phase 0 Step 0.0c, before auto-installing tools.

```
Present via AskUserQuestion:

"BRIDGE installs the latest version of each tool by default.
 This means different runs may use different versions.

 Options:
   a) Always install latest (default -- you get the newest features and fixes)
   b) Pin to tested versions for consistent, reproducible results

Default if no response: (a) Latest
```

If user chooses (b), read `bridge-tool-versions.json` (if it exists in the pipeline resources directory) and install pinned versions. If no version file exists, inform user and fall back to latest.

### WARN-04: External Content in Commands (CRIT-04)
**When:** Phase 4 Build — an agent is about to execute a Bash command whose content substantially matches text found in recently crawled external content (from Phase 2 or Phase 4 research).

Detection: The orchestrator compares the Bash command string against cached crawl4ai/WebFetch/WebSearch results from the current session. If >60% of the command text matches external content, trigger this prompt.

```
Present via AskUserQuestion:

"A command about to run looks similar to text found on an external website.
 Running commands from external sources can be risky.

 Command: {command preview, first 200 chars}
 Source: {URL where similar text was found}

 Options:
   a) Allow this command
   b) Skip this command
   c) Show me the full command before deciding

Default if no response: (a) Allow (with warning logged to security-events.log)
```

### WARN-05: Security Gate Verification (CRIT-05)
**When:** Phase 5 start, before running any validators.

```
Present via AskUserQuestion:

"Before running final validation, confirming your security settings:

 Security gate: {current value from config.json -- BLOCKING or ADVISORY}
 Meaning: {if blocking: 'Critical security issues must be resolved before delivery'
           if advisory: 'Security issues are logged but do not block delivery'}

 Is this correct?
   a) Yes, proceed with current settings
   b) Change to BLOCKING (stricter)
   c) Change to ADVISORY (I accept the risk)

Default if no response: (a) Proceed with current
```

If the value was changed from the Phase 0 default (blocking), highlight this: "Note: This was originally set to BLOCKING but was changed during the pipeline."

### WARN-06: Remote Installer Scripts (CRIT-06)
**When:** Phase 0 Step 0.0c — when uv or D2 installation falls back to `curl | sh`.

```
Present via AskUserQuestion:

"To install {tool}, BRIDGE needs to download and run an installer script
 from {domain} (the tool vendor's official installer).

 Options:
   a) Download and run the installer (vendor-recommended method)
   b) Skip -- I will install {tool} manually later
   c) Show me the installer URL before deciding

Default if no response: (a) Download and run
```

### WARN-07: Hook Enforcement Level (A05-1)
**When:** Phase 0 Step 0.4 — hook setup (already exists as a prompt; this refines the language).

```
Present via AskUserQuestion:

"BRIDGE has safety checks that detect dangerous operations during the build:
 - Deleting important files
 - Exposing passwords or API keys in code
 - Writing outside the project folder

 Right now they warn you but do not stop the action.

 Options:
   a) Keep warnings only (recommended for your first project)
   b) Block dangerous operations automatically (stricter -- may interrupt workflow)

Default if no response: (a) Warnings only
```

### WARN-08: Large Dependency Count (A04-3)
**When:** Phase 4 Step 4.1 — when the Solution Proposal specifies >20 npm/pip packages to install.

```
Present via AskUserQuestion:

"This project requires installing {N} packages ({M} npm + {K} pip).
 That is above the typical range. More packages mean more potential
 security exposure.

 Options:
   a) Continue -- I trust the package list
   b) Show me the full list before installing
   c) Review each package one by one

Default if no response: (a) Continue
```

### WARN-09: Strict Agent Tools (V1-ARCH-01)
**When:** Phase 0 config setup — only if user explicitly asks for enhanced security.
**This is a config toggle, not an automatic prompt.** Set via config:
```json
{
  "strict_agent_tools": false
}
```

When enabled: researchers get Read/Glob/Grep/WebSearch/WebFetch only (no Write/Edit/Bash). Builders get Write/Edit/Bash but not Agent (cannot spawn sub-agents). This is experimental and may break complex projects.

---

## Deliverable WARN Prompts

### WARN-D1: Credential Documentation (V2-AUTH-01)
**When:** Phase 1 Translate — only if the user's input mentions APIs, integrations, authentication, third-party services, or similar keywords.
**Do NOT ask proactively** if the project has no integration component.

```
Present via AskUserQuestion:

"This project involves external service integrations.
 Would you like to document which credentials or API keys will be needed?
 This helps future team members set up the environment.

 Options:
   a) Yes, let me list the services and their auth methods
   b) Not now -- I will handle credentials separately
   c) No integrations need credentials

Default if no response: (b) Not now
```

If (a): add a "Credentials Required" section to `pipeline/00-constraints.md` listing service names and env var names (NEVER values).

### WARN-D2: Early Exit Deliverable Scope (WSTG-BUSL-01)
**When:** User chooses "Stop here and generate deliverables" before Phase 5 completes.

```
Present via AskUserQuestion:

"You are generating deliverables without completing the full validation phase.
 How would you like to indicate this in the deliverables?

 Options:
   a) Add scope statement: 'Scope: Architecture design and technology assessment'
   b) Add note: 'Implementation validation pending -- to be completed in next phase'
   c) No additional note -- I will handle this in the engagement letter

Default if no response: (a) Scope statement
```

---

## Internal Policy Changes (WARN Interno)

These changes modify the pipeline's .md instruction files. They are enforced by agent instruction, not by hooks (except A01-2 which recommends a hook).

### POLICY-01: Sanitization of [EXTERNAL-UNVERIFIED] (V8-DATA-01)
**File changed:** `modules/sanitization-checklist.md`
**Old rule:** `[EXTERNAL-UNVERIFIED] -> (remove tag entirely -- present as validated finding)`
**New rule:** `[EXTERNAL-UNVERIFIED] -> transform to consulting-appropriate language:`
- In research reports (internal): KEEP the tag visible for validators
- In client deliverables: replace with "Based on vendor documentation and community sources as of {date}"
- NEVER present unverified external findings as if they were independently validated

The Validator (Step 5.1a) should check that no raw `[EXTERNAL-UNVERIFIED]` tags appear in `deliverables/` files, and that transformed versions include a date reference.

### POLICY-02: SVG Script Sanitization (WSTG-CLNT-01)
**Instruction added to:** `modules/sanitization-checklist.md`
When generating HTML deliverables that embed SVG diagrams:
- Strip `<script>` tags from embedded SVGs (SVGs should be visual only)
- Preserve `<script>` tags in the HTML document itself (needed for panzoom, Remotion renders)
- This only applies to SVGs -- inline HTML scripts for interactivity are allowed

### POLICY-03: Client Data Read Scope (A01-2)
**Recommendation:** Create a hookify rule that warns when any agent attempts to Read/Glob files in `clients/*/` where `*` does not match the current project's client slug.
**Current enforcement:** Instruction-only in `client-knowledge-graph.md` ("NEVER access another client's knowledge")
**Gap:** If an agent constructs its own file paths (e.g., `ls clients/*/`), the instruction may be ignored.
**Action:** Add hookify rule (recommended, not mandatory):
```
Rule: client-data-isolation
Event: PreToolUse (Read, Glob, Grep)
Pattern: path contains "clients/" AND path does NOT contain "clients/{current-client-slug}/"
Action: warn ("Reading data from a different client's directory. This may violate client data isolation.")
```

### POLICY-04: Multi-Source Validation (A03-4)
**Instruction reinforced in:** `references/tool-risk-matrix.md`
Already states: "Validate tainted claims against at least 2 independent sources."
No additional enforcement possible -- this is inherently an LLM judgment call. The instruction remains as-is.

### POLICY-05: State File Validation on Resume (A08-2)
**Instruction added to:** `modules/pipeline-state.md`
On resume, after reading state.json:
```
# Cross-check state.json against filesystem reality
completed_per_state = state.json.completed_phases
completed_per_files = [N for N in range(6) if glob(f"pipeline/0{N}-*.md")]

IF completed_per_state != completed_per_files:
  WARN user: "Pipeline state file does not match actual files on disk.
              State says phases {completed_per_state} are complete.
              Files on disk show phases {completed_per_files} are complete.
              Using filesystem as source of truth."
  Reconstruct state.json from filesystem.
```

---

## Documentation of Known Limitations

### KNOWN-01: No Client Data Encryption at Rest (A02-1)
**Noted in:** `modules/client-knowledge-graph.md`
Client knowledge graphs and pipeline artifacts are stored as plaintext JSON and Markdown. For clients with compliance requirements (SOC 2, HIPAA, GDPR), recommend enabling OS-level encryption (BitLocker on Windows, FileVault on macOS) or using an encrypted filesystem for the workspace directory.

### KNOWN-02: No Sandbox for External Content Processing (A06-3)
**Noted in:** `modules/doc-access-strategy.md`
crawl4ai and yt-dlp process untrusted content from the internet without sandboxing. For high-security projects, consider running these tools inside a Docker container or VM. The pipeline operates identically with containerized tools -- only the execution environment changes.

### KNOWN-03: Single-Operator Model (A07-1)
**Noted in:** `orchestrator/core.md`
BRIDGE operates under the invoking user's OS permissions. There is no pipeline-level authentication or role-based access control. Multi-user access control is delegated to the operating system and Claude Code's own authentication. For team environments, use OS-level file permissions to restrict access to the workspace directory.

### KNOWN-04: Knowledge Graph Sensitivity (V6-CRYPT-01)
**Noted in:** `modules/client-knowledge-graph.md`
The `graph.json` schema includes a `data_sensitivity` field. When set to "high", the pipeline recommends encrypting the `.knowledge/` directory. This is informational -- the pipeline does not encrypt files itself.

---

## FALSE POSITIVE Documentation

### FP-01: Agent Self-Modification (A04-2)
**Original finding:** "Agents can modify other agents' definitions in .claude/agents/"
**Disposition:** FALSE POSITIVE
**Evidence:**
- Exhaustive grep shows ZERO specialist instructions to write to `.claude/agents/`
- Only the orchestrator writes agent files (Phase 4 Step 4.1, line 83 of 04-build.md)
- Specialists write to `src/` and `tests/` per instruction (line 271 of 04-build.md)
- The `Skill` tool (needed to create agents) is explicitly blocked for sub-agents (tool-matrix.md line 5)
- The `.claude/agents/` exclusion in Scope Guard exists for the orchestrator, not for specialists

**Architectural gap (theoretical):** A specialist with Write tool COULD technically write to `.claude/agents/` because the scope guard excludes that directory. However, no specialist has instructions to do so, and this would require either manual prompt manipulation or a successful prompt injection attack that specifically targets agent definitions.

**No code change needed.** Document as a theoretical gap for future hardening.

---

## Subsumido Findings (already covered)

| Finding | Covered by |
|---------|-----------|
| V14-CONF-03 (config.json writable) | WARN-05 (security gate verification at Phase 5 start) |
| A05-3 (npm no integrity) | WARN-03 (version pinning decision) |
| V1-ARCH-02 (no privilege separation) | WARN-09 (strict agent tools config toggle) |
| V5-VAL-02 (taint tracking instruction-only) | WARN-04 (tainted command detection) |
| V14-CONF-02 (hooks warn default) | WARN-07 (hook enforcement level prompt) |
| WSTG-CONF-01 (npm no audit) | WARN-02 (tool installation security) |
| WSTG-BUSL-02 (risk acceptance no audit) | FIX #3 (risk-acceptances.json -- implemented in 05-validate.md) |
