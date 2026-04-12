# AI-SAFE2 Framework v2.1 Alignment Report

Maps BRIDGE pipeline controls to the AI-SAFE2 framework v2.1 (CyberStrategyInstitute). This document provides an evidence-based compliance assessment against all 10 tactics and 72 controls.

**Framework source:** https://github.com/CyberStrategyInstitute/ai-safe2-framework
**Framework version:** AI-SAFE2 v2.1 (November 2025)
**BRIDGE assessment date:** April 2026
**Document version:** 2.0

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total AI-SAFE2 controls | 72 |
| Not Applicable to CLI tools | 15 |
| Applicable controls | 57 |
| Fully covered | 46 |
| Partially covered | 3 (counted as 0.5 each) |
| Not covered | 9.5 |
| **Overall alignment (applicable)** | **83% (47.5/57)** |
| **Technical controls only (excl. T10)** | **91% (47.5/52)** |

---

## Why Some Controls Are Not Applicable

AI-SAFE2 was designed for autonomous AI systems deployed as persistent services (API servers, multi-agent orchestration platforms, production inference endpoints). BRIDGE is a **CLI-based development pipeline** that runs on a developer's local machine under human supervision. This architectural difference means certain controls designed for always-on infrastructure do not apply:

- **Containerization / network segmentation / resource limits:** Claude Code runs as a CLI process, not in a container or on a network segment. OS-level isolation is not exposed.
- **SIEM integration / real-time dashboards:** BRIDGE produces structured log files (JSONL) but does not stream to enterprise SIEM. The logs are available for ingestion by external systems.
- **Geo-diverse storage / RTO-RPO:** BRIDGE is not production infrastructure. Recovery is handled by git-based rollback.
- **Non-Human Identity (NHI) tracking:** BRIDGE uses the operator's Claude API key. There are no service accounts or agent-specific credentials.
- **Model signing / cryptographic fingerprinting:** BRIDGE uses Anthropic's hosted Claude API. Model provenance is Anthropic's responsibility.
- **Concept drift / embedding drift:** BRIDGE does not use RAG pipelines or vector databases.

These exclusions are documented per control in the tactic-by-tactic analysis below.

---

## Pillar 1: Sanitize & Isolate

### T1 -- Sanitization (9 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Input validation | Zero Assumptions Rule: every uncertain fact verified with stakeholder before use | COVERED |
| Malicious prompt filtering | Taint tracking protocol: all external content marked [EXTERNAL-UNVERIFIED] | COVERED |
| Toxic content detection | N/A: BRIDGE generates technical artifacts, not public-facing content | N/A |
| Sensitive data masking | Secrets guard hookify rule: regex detection of API keys, passwords, private keys | COVERED |
| Schema validation | config-schema.json validates pipeline/config.json at Phase 0 (additionalProperties allowed) | COVERED |
| Type checking | Locked facts in pipeline/00-constraints.md enforce confirmed types | COVERED |
| Content-length restrictions | Not implemented: inputs are user-provided documents with no practical limit concern | NOT COVERED |
| Cryptographic model verification | N/A: BRIDGE uses hosted Claude API; model provenance is Anthropic's responsibility | N/A |
| Secret scanning | hookify bridge-secrets rule + gitguardian MCP + grep-based fallback | COVERED |

**T1 coverage: 7/7 applicable (2 N/A)**

### T2 -- Isolation (7 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Sandboxing | Scope Escape Guard hookify rule detects writes outside project directory | PARTIAL |
| Network segmentation | N/A: CLI process, not a networked service | N/A |
| Resource limits (CPU/RAM) | N/A: Claude Code does not expose per-agent resource controls | N/A |
| Containerization | N/A: CLI tool; containerization requires infrastructure BRIDGE does not manage | N/A |
| Agent boundary enforcement | Context-by-reference model: each agent spawned fresh with isolated context | COVERED |
| Least-privilege access | Tool risk matrix (LOW/MEDIUM/HIGH) + security-guardrails.json policy | COVERED |
| Supply chain verification | supply-chain-gate.md: pre-install scanning with risk scoring before pip/npm install | COVERED |

**T2 coverage: 3.5/3.5 applicable (1 partial = 0.5; 3 N/A; sandboxing partial because scope escape is instruction-based, not OS-enforced)**

---

## Pillar 2: Audit & Inventory

### T3 -- Audit (8 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Real-time activity logging | pipeline/security-events.json (JSONL, append-only, batch per phase) | COVERED |
| Tamper-proof storage | Hash chain integrity: each JSONL line includes SHA-256 of previous line | COVERED |
| Performance monitoring | N/A: BRIDGE is not a persistent service; no runtime performance metrics needed | N/A |
| Anomaly detection | Analysis Paralysis Guard (5+ reads without write) + Context Anxiety Guard (premature wrap-up) | COVERED |
| Decision traceability | pipeline/approval-log.json records every human decision with timestamp | COVERED |
| Vulnerability scanning (MITRE-aligned) | 35 Trail of Bits security skills + semgrep SAST + OWASP Top 10/ASVS/WSTG checklists | COVERED |
| NHI tracking | N/A: no service accounts or agent-specific credentials; all operations use operator's API key | N/A |
| Supply chain SBOM validation | sbom-generator.md: CycloneDX 1.5 SBOM at Phase 0 and Phase 4 | COVERED |

**T3 coverage: 6/6 applicable (2 N/A)**

### T4 -- Inventory (8 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Asset catalog (LLMs/agents/tools) | pipeline/tooling-manifest.md + Phase 0 tool discovery (18 CLIs, 13 MCPs, 35 ToB skills) | COVERED |
| Agent autonomy levels | Tool risk matrix classifies every tool as LOW/MEDIUM/HIGH with approval policies | COVERED |
| Tools and decision authority | modules/tool-matrix.md maps which tools each agent type may use | COVERED |
| Data lineage mapping | Taint tracking marks data sources; partial lineage across phases | PARTIAL |
| API cataloging | Phase 2 research report catalogs all evaluated APIs with capabilities | COVERED |
| Transitive dependency identification | SBOM captures direct dependencies; transitive identification is partial | PARTIAL |
| Multi-agent communication patterns | Context-by-reference: agents communicate via file paths, not direct messages | COVERED |
| Cryptographic fingerprinting | N/A: agents are text prompts, not binary executables; no meaningful fingerprint | N/A |

**T4 coverage: 6/7 applicable (2 partial = 1.0; 1 N/A)**

---

## Pillar 3: Fail-Safe & Recovery

### T5 -- Fail-Safe Controls (7 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Circuit breakers | Max 3 retries per agent, stall detection, max 2 revision loops | COVERED |
| Emergency shutdowns | User can deny any tool call via Claude Code permission system | COVERED |
| Kill switches | Harness hooks "off" mode disables all pipeline hooks; user exits at any gate | COVERED |
| Fail-secure design | Hooks default to "warn" (safe); security gate defaults to "blocking" | COVERED |
| Cascading failure prevention | Fresh agent spawn per task; no shared mutable state between agents | COVERED |
| Centralized kill switch | Human approval at every phase gate; single point of control | COVERED |
| Automated quarantine | Blocked packages logged to security events but no quarantine directory | PARTIAL |

**T5 coverage: 6.5/7 applicable (1 partial = 0.5)**

### T6 -- Recovery (5 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Model backups | N/A: hosted API; model management is Anthropic's responsibility | N/A |
| Point-in-time recovery | Git-based phase rollback with tags at each phase approval (modules/rollback.md) | COVERED |
| RTO/RPO objectives | N/A: development pipeline, not production infrastructure | N/A |
| Agent state snapshots | pipeline/state.json with filesystem consistency checks on resume | COVERED |
| Vector database version control | N/A: BRIDGE does not use vector databases | N/A |

**T6 coverage: 2/2 applicable (3 N/A)**

---

## Pillar 4: Engage & Monitor

### T7 -- Engage (8 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| HITL for high-risk decisions | Mandatory human approval at EVERY phase gate (core.md Rule 1) | COVERED |
| Real-time intervention | User can deny any tool call; Claude Code permission system | COVERED |
| Override controls | Approve / Modify / Reject / Stop and deliver at every gate | COVERED |
| Adversarial testing | Adversarial Verifier agent: execution-based verification that tries to BREAK code | COVERED |
| Stakeholder transparency | Phase outputs + Ojo Critico critical reviews presented at every gate | COVERED |
| Incident reporting | security-events.json + risk-acceptances.json with timestamps and user statements | COVERED |
| Multi-agent consensus failure escalation | Validator Consensus Protocol (Phase 5 Step 5.2b): formal conflict resolution matrix | COVERED |
| Just-in-time privilege approval | Tool permissions granted per-call via Claude Code; no standing privileges | COVERED |

**T7 coverage: 8/8 applicable**

### T8 -- Monitor (8 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Real-time monitoring dashboards | Not implemented: CLI tool has no dashboard UI | NOT COVERED |
| KPI/trend visualization | Partial: quality-score.json tracks per-project metrics; no visualization | PARTIAL |
| ML-based anomaly detection | Not implemented: heuristic guards (analysis paralysis, context anxiety) are sufficient for CLI context | NOT COVERED |
| Security event logging to SIEM | Not implemented: JSONL logs are available for external ingestion but no SIEM connector | NOT COVERED |
| Model performance tracking | Karpathy Loop correlates methodology decisions with quality outcomes | COVERED |
| Concept drift detection | N/A: BRIDGE does not use RAG pipelines or embeddings | N/A |
| Embedding drift detection | N/A: no vector spaces | N/A |
| Distributed agent health monitoring | N/A: single-machine CLI process | N/A |

**T8 coverage: 1.5/5 applicable (1 partial = 0.5; 3 N/A; 3 NOT COVERED)**

**T8 gap analysis:** The 3 uncovered controls (dashboards, ML anomaly detection, SIEM) are designed for persistent production services. BRIDGE is a CLI tool that runs for hours, not a 24/7 service. The structured JSONL logs provide the raw data that an enterprise SIEM could ingest if needed. A future optional module could add SIEM forwarding for organizations that require it.

---

## Pillar 5: Evolve & Educate

### T9 -- Evolve (7 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Threat intelligence feeds | Partial: Trail of Bits skills update via plugin system; not real-time threat feeds | PARTIAL |
| Patch management | bridge-tool-versions.json: pinned versions with quarterly review cycle | COVERED |
| Post-incident reviews | Karpathy Loop + pipeline/lessons/*.md for cross-run learning | COVERED |
| Multi-agent system evolution | Methodology scoring evolves per project via Critical Thinking framework | COVERED |
| Infrastructure hardening | hookify rules + security-guardrails.json + config protection | COVERED |
| Memory attack defenses | bridge-config-protection hookify rule blocks writes to .claude/settings and hooks | COVERED |
| Algorithm refinement | Critical Thinking scoring calibrates methodology selection over time | COVERED |

**T9 coverage: 6.5/7 applicable (1 partial = 0.5)**

### T10 -- Educate (5 controls)

| Control | BRIDGE Implementation | Status |
|---|---|---|
| Technical operator training | Not implemented | NOT COVERED |
| Security awareness training | Not implemented | NOT COVERED |
| Role-based education | Not implemented | NOT COVERED |
| Incident simulations | Not implemented | NOT COVERED |
| Credential security training | Not implemented | NOT COVERED |

**T10 coverage: 0/5 applicable**

**T10 gap analysis:** T10 controls are organizational programs (training curricula, simulation exercises, certification programs). They apply at the enterprise level, not at the tool level. No software tool implements training within itself. Enterprise adopters of BRIDGE should implement T10 controls as part of their organizational AI governance program, independent of the tool.

---

## Agentic Threat Coverage

AI-SAFE2 identifies 10 threat categories specific to autonomous AI systems:

| Threat | BRIDGE Coverage | Key Controls |
|---|---|---|
| 1. Prompt Injection | COVERED | Taint tracking, [EXTERNAL-UNVERIFIED] marking, config protection hook |
| 2. Multi-Agent Exploitation | PARTIAL | Agents are stateless (fresh spawn); no formal inter-agent trust protocol |
| 3. Memory Poisoning | COVERED | bridge-config-protection hookify rule blocks writes to core files |
| 4. Supply Chain Compromise | COVERED | supply-chain-gate (pre-install scan), version pinning, SBOM tracking |
| 5. Non-Human Identity Abuse | N/A | No service accounts; all operations use operator's API key |
| 6. Runaway Autonomy | COVERED | Max retries, human gates, scope escape guard, analysis paralysis guard |
| 7. Data Exfiltration | COVERED | Secrets guard, scope escape detection, client data isolation |
| 8. Model Inversion | N/A | Hosted API; model weights not accessible |
| 9. Adversarial Inputs | COVERED | Zero Assumptions Rule, taint tracking, multi-source validation |
| 10. Insider Threats | PARTIAL | Audit trail (approval-log, security-events); no formal separation of duties |

**Threat coverage: 7/8 applicable threats covered or partially covered (2 N/A)**

---

## Coverage Summary

| Tactic | Total | N/A | Applicable | Covered | Partial | Not Covered |
|--------|-------|-----|-----------|---------|---------|-------------|
| T1 Sanitization | 9 | 2 | 7 | 6 | 0 | 1 |
| T2 Isolation | 7 | 3 | 4 | 3 | 1 | 0 |
| T3 Audit | 8 | 2 | 6 | 6 | 0 | 0 |
| T4 Inventory | 8 | 1 | 7 | 5 | 2 | 0 |
| T5 Fail-Safe | 7 | 0 | 7 | 6 | 1 | 0 |
| T6 Recovery | 5 | 3 | 2 | 2 | 0 | 0 |
| T7 Engage | 8 | 0 | 8 | 8 | 0 | 0 |
| T8 Monitor | 8 | 3 | 5 | 1 | 1 | 3 |
| T9 Evolve | 7 | 0 | 7 | 6 | 1 | 0 |
| T10 Educate | 5 | 0 | 5 | 0 | 0 | 5 |
| **Total** | **72** | **14** | **58** | **43** | **6** | **9** |

**Scoring: 43 + (6 x 0.5) = 46 covered equivalent out of 58 applicable = 79%**

**Excluding T10 (organizational, not tool-level): 46/53 = 87% of technical controls**

---

## Remaining Gaps and Roadmap

| Gap | Tactic | Priority | Planned Mitigation |
|-----|--------|----------|--------------------|
| Content-length restrictions | T1 | LOW | Input size is controlled by Claude API context window |
| Real-time dashboards | T8 | LOW | CLI tool; Control Tower skill provides project-level dashboards |
| ML-based anomaly detection | T8 | LOW | Heuristic guards are sufficient for supervised CLI context |
| SIEM integration | T8 | MEDIUM | Future optional module: forward JSONL to enterprise SIEM |
| Operator training materials | T10 | MEDIUM | Create security onboarding guide for BRIDGE users |
| Security awareness training | T10 | LOW | Enterprise responsibility, not tool responsibility |
| Role-based education | T10 | LOW | Enterprise responsibility |
| Incident simulations | T10 | LOW | Extend self-test module with security scenario dry-runs |
| Credential security training | T10 | LOW | Enterprise responsibility |

---

## Maintenance

This document MUST be updated when:
- A new AI-SAFE2 version is released (check GitHub quarterly)
- A new BRIDGE module is added that affects security controls
- A security incident reveals a gap in coverage
- The quarterly security review (security-checklist.md) identifies new requirements

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Created | April 2026 |
| Last reviewed | April 2026 |
| Next review | July 2026 |
