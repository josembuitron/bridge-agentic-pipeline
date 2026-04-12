# BRIDGE Software Development Lifecycle (SDLC) Policy

Defines the formal software development lifecycle implemented by the BRIDGE pipeline. This document maps BRIDGE's 6-phase pipeline to industry-standard SDLC practices for governance and compliance purposes.

---

## 1. SDLC Overview

BRIDGE implements a **gated, human-supervised SDLC** with mandatory human approval at every phase transition. No phase advances without explicit human authorization. AI agents perform work within each phase, but the human operator retains final decision authority at every gate.

```
Requirements --> Analysis --> Design --> Implementation --> Testing --> Delivery
  Phase 1        Phase 1      Phase 3      Phase 4         Phase 5    Phase 5
  (Translate)    (BRIDGE      (Architect)  (Build)         (Validate) (Deliver)
                  B-R-I-D)
```

**Pre-pipeline:** Phase 0 (Initialization) establishes tooling, configuration, and security baseline.
**Conditional:** Phase 0b (Codebase Analysis) runs only for brownfield projects.

### 1.1 Human-AI Governance Model

BRIDGE is NOT a fully automated pipeline. It is a **human-supervised, AI-assisted** development process where:

- **AI agents** perform analytical, creative, and technical work within defined boundaries
- **The human operator** makes every strategic decision, approves every deliverable, and can override, modify, or reject any agent output
- **The orchestrator** (AI) manages workflow logistics but CANNOT advance past a gate without human approval
- **No code, document, or deliverable reaches a client** without explicit human sign-off

This model ensures accountability: the human operator is always the decision-maker, and the AI agents are tools executing under supervision.

---

## 2. Phase-to-SDLC Mapping

### 2.1 Planning & Requirements (Phase 0 + Phase 1)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Requirements gathering | Phase 0: User provides business input (transcripts, emails, chats, documents) |
| Requirements analysis | Phase 1: BRIDGE B-R-I-D framework decomposes business challenge, root causes, impact, and data |
| Requirements validation | Phase 1: Zero Assumptions Rule -- every uncertain fact verified with stakeholder |
| Requirements documentation | pipeline/01-technical-definition.md (functional + non-functional requirements) |
| Assumption tracking | pipeline/00-constraints.md (locked facts -- immutable after confirmation) |
| Critical review | Ojo Critico agent challenges Phase 1 output before approval |

**Gate:** Human reviews technical definition. Options: Approve / Modify / Reject / Stop and deliver.
**What happens at this gate:** The orchestrator presents the full technical definition, the BRIDGE analysis (B-R-I-D decomposition), and the Ojo Critico critical review. The human reads all three documents and decides whether the AI correctly understood the requirements. If the human selects "Modify," the Translator agent is re-spawned with the human's feedback. If "Reject," the phase restarts from scratch.

### 2.2 Research & Feasibility (Phase 2)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Technology assessment | Phase 2 Researcher evaluates APIs, platforms, libraries against requirements |
| Feasibility analysis | BRIDGE D-validated: data availability confirmed against real API capabilities |
| Risk assessment | Tool risk matrix classifies all recommended technologies (LOW/MEDIUM/HIGH) |
| Supply chain evaluation | Pre-install scanning, version verification, CVE checks |
| Documentation | pipeline/02-research-report.md with taint-tracked external sources |

**Gate:** Human reviews research findings. Options: Approve / Modify / Reject / Stop and deliver.
**What happens at this gate:** The human sees the research report with all recommended technologies, their risk classifications, and the Ojo Critico challenge. The human can reject technologies they consider inappropriate, add requirements not covered, or redirect the research entirely.

### 2.3 Design & Architecture (Phase 3)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Solution architecture | Phase 3 Architect designs component structure, data flows, deployment |
| Methodology selection | Critical Thinking framework selects TDD, BDD, or other methodology |
| Effort estimation | 3-scenario estimation (optimistic, likely, pessimistic) with confidence |
| Security design | Entry point analysis, insecure defaults detection, audit context building |
| Quality hooks design | Pre-commit hooks specified per technology stack |
| Plan verification | 7-dimension plan checker validates completeness |

**Gate:** Human reviews solution proposal + effort estimate. Options: Approve / Modify / Reject / Stop and deliver.
**What happens at this gate:** The human reviews the complete architecture with file manifests, component diagrams, and cost/effort estimates. This is typically the most significant decision point -- the human is approving the entire technical direction before any code is written. The human can modify the architecture, change the technology stack, adjust scope, or reject the approach entirely.

### 2.4 Implementation (Phase 4)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Code development | Dynamic specialist agents execute vertical slices |
| Test-driven development | TDD methodology embedded in all code-writing specialists |
| Static analysis | Per-slice semgrep SAST scanning (shift-left) |
| Code quality | ESLint/Ruff enforcement via pre-commit hooks |
| Dependency management | Supply chain gate scans new dependencies before installation |
| SBOM tracking | pipeline/sbom.json updated with each new dependency |
| Progress tracking | Build manifest tracks specialist completion, hook warnings, test results |

**Gate per slice:** Orchestrator reviews specialist output. Auto-fix for bugs, escalate for architecture changes.
**Gate at phase end:** Human reviews build manifest + all accumulated hook warnings.
**What happens at gates:** During implementation, there are two levels of gates. Slice-level gates are managed by the orchestrator (AI) -- it can auto-approve bug fixes but MUST escalate architecture deviations to the human. The phase-level gate requires the human to review the complete build manifest showing all code written, tests passing, hook warnings triggered, and any deviations from the architecture.

### 2.5 Testing & Validation (Phase 5)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Requirements validation | Validator agent checks every requirement against implementation |
| Code review | Code Reviewer agent + PR Review Toolkit (6-pass review) |
| Adversarial testing | Adversarial Verifier attempts to break implementation by EXECUTING code |
| Security audit | Security Auditor agent runs SAST + secrets scan + OWASP checks |
| Cross-LLM review | Codex/Gemini challenge Claude's findings (discrepancy tagging) |
| False positive elimination | fp-check skill verifies all security findings |
| Compliance check | spec-to-code-compliance verifies spec vs implementation alignment |

**Gate:** Human reviews validation report. BLOCKING if critical security findings exist.
**What happens at this gate:** The human receives the consolidated results from all 4+ validation agents, the cross-LLM review (if available), and the security gate verdict. If the security gate is BLOCKED (critical findings), the human MUST explicitly decide: auto-fix, manual fix, accept risk (with documented reason per finding), or abort delivery. Risk acceptance is intentionally friction-heavy -- the human must type "I accept the risk for: {specific finding}" for each critical finding.

### 2.6 Delivery (Phase 5 continued)

| Activity | BRIDGE Implementation |
|----------|----------------------|
| Deliverable generation | Client-sanitized documents (HTML, PPTX, DOCX, XLSX) |
| Sanitization | Sanitization checklist removes all internal references |
| SBOM finalization | Final SBOM with all components, versions, licenses |
| Knowledge capture | Client knowledge graph updated for future projects |
| Learning loop | Karpathy Loop correlates decisions with quality outcomes |

**Gate:** Human reviews final deliverables before client handoff.
**What happens at this gate:** The human reviews every deliverable that will reach the client. The sanitization checklist ensures no agent names, skill references, or pipeline internals leak into client documents. The human has final authority on what ships.

---

## 3. Security Controls Across SDLC

| SDLC Phase | Security Controls |
|------------|------------------|
| Planning | Zero Assumptions Rule, locked constraints, supply chain pre-install gate |
| Research | Taint tracking, multi-source validation, tool risk classification, [EXTERNAL-UNVERIFIED] marking |
| Design | Entry point analysis, insecure defaults detection, hook specification, audit context building |
| Implementation | Pre-commit hooks, per-slice SAST, supply chain gate, SBOM tracking, version pinning |
| Testing | 4-agent validation, adversarial execution testing, cross-LLM review, secrets scan, OWASP audit |
| Delivery | Sanitization, SVG script stripping, security gate (blocking/advisory), risk acceptance audit log |

---

## 4. Roles & Responsibilities

### 4.1 The Human Operator (Pipeline Operator)

The human operator is the ultimate authority in every BRIDGE pipeline execution. No AI agent can override, bypass, or circumvent a human decision.

| Responsibility | Details |
|----------------|---------|
| **Provides requirements** | Supplies business input in any format (transcripts, emails, chats, documents) |
| **Approves at every gate** | Reviews AI agent output at each phase boundary. Options: Approve / Modify / Reject / Stop and deliver |
| **Overrides when needed** | Can reject any agent output, modify any deliverable, change any technical decision |
| **Accepts risk explicitly** | When security findings are present, must explicitly accept each risk with documented reason |
| **Controls tool permissions** | Claude Code's permission system means the human approves or denies every tool call the AI attempts |
| **Final sign-off on deliverables** | No document, code, or artifact reaches a client without human review |

### 4.2 The Orchestrator (AI)

The orchestrator manages the logistics of the pipeline but does NOT make strategic decisions.

| Responsibility | Details |
|----------------|---------|
| **Manages phase flow** | Reads config, spawns agents, collects outputs, presents results at gates |
| **Enforces gates** | Verifies required artifacts exist (via Glob) before allowing phase advancement |
| **Maintains audit trail** | Writes to approval-log.json, security-events.json, state.json after every gate |
| **Handles error recovery** | Max 3 retries per agent, stall detection, context anxiety detection |
| **Context management** | Passes file paths (not inline content) to agents, manages context budget |

**What the orchestrator CANNOT do:**
- Advance past a gate without human approval
- Override a security gate BLOCK
- Skip Phase 5 validation
- Modify client deliverables without human review

### 4.3 Phase Agents (AI)

Each phase has one or more specialized agents that perform the work. These agents are spawned fresh for each task with a focused context window.

| Agent | Phase | Role | Tool Permissions |
|-------|-------|------|-----------------|
| **Translator** | 1 | Decomposes business requirements using BRIDGE B-R-I-D framework | Read, Write (pipeline/ only) |
| **Researcher** | 2 | Evaluates technologies, APIs, and tools against requirements | Read, WebFetch, crawl4ai, Write (pipeline/ only) |
| **Architect** | 3 | Designs solution architecture, file manifests, deployment strategy | Read, Write (pipeline/ only) |
| **Specialists** (dynamic) | 4 | Write code, tests, and configuration in vertical slices | Read, Write, Edit, Bash (project scope only) |
| **Ojo Critico** | 1-3 | Challenges each phase output with default-REJECT posture before human gate | Read only |

### 4.4 Validation Agents (AI) -- Phase 5

Phase 5 deploys multiple independent validation agents, each with a distinct methodology and epistemological approach. This design prevents the "confirmation bias" problem where a single method's blind spots become the system's blind spots.

#### 4.4.1 Validator Agent (Requirements & Architecture)

**Purpose:** Verifies that the implementation satisfies every requirement and matches the approved architecture.

**Methodology -- Goal-Backward Verification:**
1. Starts from the business goal (BRIDGE "B") and works backward
2. For each goal: identifies conditions that must be TRUE for the goal to be met
3. For each condition: verifies the code makes it true
4. For each piece of code: checks it is substantive (not a stub) and wired (connected to the system)

**Anti-Praise Guard:** The Validator operates under an Anti-Praise Guard inspired by Anthropic's Harness Design research. This research found that "evaluators identify legitimate issues but talk themselves into approving mediocre work anyway." The Validator's default posture is REJECT -- it requires evidence for every PASS claim. Phrases like "the code looks solid" or "the architecture is well-structured" are explicitly flagged as insufficient. The Validator must cite specific file:line references for every claim.

**Rubric Scoring (weighted dimensions):**

| Dimension | Weight | 1 (Fail) | 3 (Acceptable) | 5 (Excellent) |
|---|---|---|---|---|
| Requirements Coverage | 35% | >20% REQs unimplemented | All critical REQs done | 100% REQs with edge cases |
| Architecture Compliance | 20% | Major deviations | File structure matches | Exact match documented |
| Functional Correctness | 25% | Core features broken | Happy paths work | All paths incl. errors |
| Test Quality | 10% | No tests | Tests for main flows | TDD evidence, edge cases |
| Documentation Sync | 10% | Docs contradict code | Docs mostly current | Zero DOC_DRIFT |

**Threshold:** Score >= 3.0 = APPROVE, 2.0-2.99 = CONDITIONAL, < 2.0 = REJECT.

**Output:** pipeline/05-validation-report.md with APPROVE/REJECT verdict.

#### 4.4.2 Code Reviewer Agent

**Purpose:** Reviews code quality, test coverage, and engineering best practices.

**Checks performed:**
- Clean code: naming conventions, single responsibility, structure
- Error handling at system boundaries (user input, external APIs)
- YAGNI compliance (no over-engineering)
- Test quality: meaningful assertions, edge cases, no `assert(true)` stubs
- Documentation completeness
- ESLint/Ruff rule compliance (runs tool, not just reads code)

**Also invokes the PR Review Toolkit (6-pass review):**
1. Code Reviewer -- guidelines compliance, bug detection
2. PR Test Analyzer -- test coverage quality assessment
3. Silent Failure Hunter -- empty catches, missing error logging, swallowed exceptions
4. Type Design Analyzer -- type encapsulation and design
5. Comment Analyzer -- comment accuracy vs code behavior
6. Code Simplifier -- simplification opportunities

**Output:** pipeline/05a-code-review.md + pipeline/05b-pr-review.md.

#### 4.4.3 Adversarial Verifier Agent

**Purpose:** Attempts to BREAK the implementation by EXECUTING it, not just reading it.

**Key distinction:** While the Validator READS code to verify logic, the Adversarial Verifier RUNS code to verify behavior. This is a critical epistemological difference -- reading code tells you what it should do; executing code tells you what it actually does.

**Design philosophy:** "A builder agent saying 'endpoint works' is not evidence -- `curl localhost:8000/api/endpoint` returning the expected response IS evidence."

**Methodology -- Execution-Based Verification:**
1. Reads README/package.json/pyproject.toml for build and test commands
2. Runs the BUILD. A broken build = automatic FAIL
3. Runs the TEST SUITE. Failing tests = automatic FAIL
4. Runs LINTERS if configured
5. Applies project-type-specific adversarial probes:
   - **API projects:** Curls every documented endpoint with valid input, empty input, invalid input, and boundary values. Tests idempotency (same POST twice). Tests without auth headers.
   - **Data pipelines:** Runs with empty input, single row, null/NaN values. Counts rows in vs rows out.
   - **Dashboards:** Starts dev server. If Playwright is available, navigates to every page, takes screenshots, checks for console errors, clicks primary buttons. Tests empty data state.
   - **Enterprise features:** Combines API + dashboard strategies. Tests role-based access if specified.

**Mandatory adversarial probes (at least one per verification):**
- Boundary values: 0, -1, empty string, 10000-char string, null, undefined
- Idempotency: same mutating request twice
- Missing references: request entity that does not exist
- Type confusion: send string where number expected, array where object expected

**Anti-Rationalization Guards:** The agent is explicitly instructed to recognize and resist excuses like "the code looks correct based on my reading" (reading is not verification -- RUN IT) and "the builder's tests already pass" (the builder is an LLM -- its tests may be circular assertions).

**Output format:** Every check requires a "Command run" block with the exact command executed and the actual terminal output. A check WITHOUT a command run block is NOT accepted as a PASS.

**Model:** Runs on Opus (highest-stakes verification).
**Output:** pipeline/05e-adversarial-verification.md.

#### 4.4.4 Security Auditor Agent

**Purpose:** Performs comprehensive security scanning using established frameworks, methodologies, and automated tools.

**Security frameworks applied:**

| Framework | Version | Application |
|-----------|---------|-------------|
| OWASP Top 10 | 2021 | All endpoints reviewed against top 10 web application risks |
| OWASP ASVS | v4.0 | Application Security Verification Standard -- architecture and code-level checks |
| OWASP WSTG | v4.2 | Web Security Testing Guide -- specific test procedures for each category |
| CWE/SANS Top 25 | 2023 | Most dangerous software weaknesses cross-referenced |

**Automated tools executed:**

| Tool | Purpose | How invoked |
|------|---------|-------------|
| **Semgrep** | SAST (Static Application Security Testing) | `semgrep scan --config auto --json {src/}` with auto-detected rulesets per language |
| **GitGuardian MCP** | Secrets detection | MCP tool call if available; falls back to regex-based grep for API keys, passwords, private keys |
| **npm audit / pip-audit** | Dependency vulnerability audit | `npm audit --json` or `pip-audit --format json` for known CVEs in dependencies |
| **Trail of Bits skills (35)** | Specialized security analysis | See detailed list below |

**Trail of Bits security skills invoked in Phase 5:**

| Skill | Purpose |
|-------|---------|
| `static-analysis` | Deep SAST via CodeQL + Semgrep + SARIF aggregation |
| `supply-chain-risk-auditor` | Dependency audit: CVEs, typosquatting, malicious packages, maintainer changes |
| `differential-review` | Code drift detection vs. approved architecture plan |
| `spec-to-code-compliance` | Verify final code implements spec with evidence-based alignment |
| `audit-context-building` | Ultra-granular analysis: modules, actors, storage, cross-function data flows |
| `fp-check` | Systematic false positive verification -- every finding must be proven exploitable or dismissed with evidence |
| `entry-point-analyzer` | Identifies all state-changing entry points (public, admin, role-restricted, contract-only) |
| `insecure-defaults` | Detects fail-open defaults: hardcoded secrets, weak auth, permissive security |
| `sharp-edges` | Identifies error-prone APIs, dangerous configs, and footgun designs |
| `variant-analysis` | If vulnerability found: searches for the same pattern across entire codebase |
| `semgrep-rule-creator` | If vulnerability found: creates custom Semgrep rule for the project-specific pattern |
| `agentic-actions-auditor` | If GitHub Actions CI/CD: audits for AI agent workflow vulnerabilities |
| `zeroize-audit` | If crypto/secrets in memory: detects missing zeroization |
| `constant-time-analysis` | If timing-sensitive crypto: detects compiler-induced timing side-channels |

**Mandatory checks (all projects):**
1. SAST scan of all source code
2. Secrets detection across entire project
3. Dependency vulnerability audit
4. OWASP Top 10 review on all endpoints
5. Hardcoded credentials check
6. Insecure defaults review

**Security gate (BLOCKING by default):**
- ANY CRITICAL finding = BLOCKED. Delivery cannot proceed.
- Human must choose: auto-fix, manual fix, accept risk (with documented reason per finding), or abort.
- Risk acceptance requires typing "I accept the risk for: {specific finding}" for each critical item.
- All risk acceptances are logged to pipeline/risk-acceptances.json with timestamp and user statement.

**Output:** pipeline/05c-security-audit.md with SECURE/BLOCKED verdict.

#### 4.4.5 Cross-LLM Adversarial Review (Optional)

**Purpose:** Eliminates single-model bias by having a fundamentally different AI model challenge Claude's findings.

**How it works:**
1. OpenAI Codex CLI or Google Gemini CLI (if installed) receives the same codebase
2. The external model performs its own independent review
3. Findings are consolidated against Claude's validation outputs
4. Each finding is tagged:
   - `CROSS_LLM_CONFIRMED` -- both models flagged the same issue (boosted confidence)
   - `CROSS_LLM_DISCREPANCY` -- external model found something Claude missed (REQUIRES human review)
   - `CROSS_LLM_CONTRADICTION` -- external model contradicts a Claude PASS (escalated to human)
   - `CLAUDE_ONLY` -- Claude found something the external model did not (informational)

**Discrepancies and contradictions do NOT auto-fix** -- they require human decision. This ensures that when two AI systems disagree, the human makes the call.

**Quality score impact:**
- Full agreement: +0.05 bonus to quality score
- Minor disagreement (<=2 discrepancies): +0.02 bonus
- Contradictions: -0.05 penalty (forces human attention)

**Output:** pipeline/05f-consolidated-review.md.

---

## 5. Phase Gate Enforcement Detail

### 5.1 Gate Structure

Every phase gate follows this exact sequence:

```
Agent completes work
  |
  v
Ojo Critico challenges output (Phases 1-3)
  |
  v
Orchestrator verifies required artifacts exist (Glob check)
  |
  v
Security events written to pipeline/security-events.json
  |
  v
Orchestrator presents results to human operator
  |
  v
Human decides: Approve / Modify / Reject / Stop and deliver
  |
  v
Decision logged to pipeline/approval-log.json with timestamp
  |
  v
Git tag created for rollback point
  |
  v
Pipeline advances (or loops/stops based on decision)
```

### 5.2 What the Human Sees at Each Gate

The orchestrator presents a structured summary that always includes:

1. **Phase output** -- the primary deliverable of the phase
2. **Critical review** -- Ojo Critico's challenge (Phases 1-3)
3. **Hook warnings** -- any security events triggered during the phase
4. **Decision options** -- always at minimum: Approve / Modify / Reject / Stop and deliver
5. **Risk context** -- any unresolved warnings or decisions needed

### 5.3 Rejection and Revision Loops

When a human rejects or modifies:
- **Modify:** The responsible agent is re-spawned with the human's specific feedback. The modified output goes through the gate again.
- **Reject:** The phase restarts from scratch. Previous artifacts are preserved for reference but not reused.
- **Maximum revision loops:** 2 per phase (configurable). After 2 failed revisions, the orchestrator escalates to the human with a summary of all attempts.

### 5.4 Stop and Deliver (Early Exit)

At any gate, the human can choose "Stop and deliver." This generates client-ready deliverables from whatever phases have completed so far. For example, stopping after Phase 3 delivers a requirements document, research report, and solution proposal -- without code.

---

## 6. Audit Trail

Every BRIDGE project produces these audit artifacts:

| Artifact | Purpose | Location |
|----------|---------|----------|
| Approval log | Every human decision with timestamp | pipeline/approval-log.json |
| Security events | Every security-relevant event (structured JSONL) | pipeline/security-events.json |
| Tooling manifest | Every tool and agent used per phase | pipeline/tooling-manifest.md |
| SBOM | Software bill of materials (CycloneDX 1.5) | pipeline/sbom.json |
| Phase artifacts | Detailed output per phase | pipeline/0N-*.md |
| Build manifest | Implementation progress and status | pipeline/04-build-manifest.md |
| Validation report | Requirements coverage and quality scores | pipeline/05-validation-report.md |
| Risk acceptances | Explicitly accepted security risks with reasons | pipeline/risk-acceptances.json |
| Quality score | Composite quality score with weighted breakdown | pipeline/quality-score.json |

---

## 7. Compliance Framework Alignment

| Framework | Alignment | Notes |
|-----------|-----------|-------|
| AI-SAFE2 v2.1 | 95% (38/40 controls) | See references/ai-safe2-alignment.md |
| OWASP Top 10 (2021) | Audited, 38/38 findings addressed | See BRIDGE-Security-Audit-Report.pdf |
| OWASP ASVS v4.0 | Audited, findings addressed | See security-remediations.md |
| OWASP WSTG v4.2 | Audited, findings addressed | See security-remediations.md |
| ISO/IEC 42001 | Partial (via AI-SAFE2 mapping) | AI management system standard |
| NIST AI RMF | Partial (via AI-SAFE2 mapping) | AI risk management framework |
| MITRE ATLAS | Partial (via AI-SAFE2 mapping) | Adversarial Threat Landscape for AI Systems |

---

## 8. Continuous Improvement

- **Per-project:** Karpathy Loop evaluates quality outcomes and calibrates methodology scoring
- **Quarterly:** Security checklist review (references/security-checklist.md) -- update versions, CVEs, framework alignment
- **On-incident:** Immediate post-mortem, update locked constraints, add hookify rules as needed
- **Cross-project:** Dream Consolidation aggregates learnings across client engagements into the client knowledge graph

---

## 9. Document Control

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Created | April 2026 |
| Last reviewed | April 2026 |
| Next review | July 2026 |
| Owner | Pipeline operator |
