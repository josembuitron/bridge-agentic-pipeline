# Solution Proposal

## Project: [name]
## Date: [date]
## Architect: Solution Architect Agent

---

## A. Architecture Overview

### System Architecture Diagram
```mermaid
graph TD
    [diagram here]
```

### Components
| Component | Purpose | Technology |
|-----------|---------|-----------|

### Data Flow
[Description of how data moves through the system]

### Integration Points
| Source | Target | Method | Authentication |
|--------|--------|--------|---------------|

---

## B. File Manifest
| File Path | Purpose | Owner Agent | Priority |
|-----------|---------|-------------|----------|

---

## C. Technology Stack
| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|

---

## D. Required Specialists

### Specialist 1
- role: spec-[name]
- description: [what this agent does]
- task: [specific task for this project]
- tools: [Read, Write, Edit, Bash, Glob, Grep]
- knowledge_keys: [sections from Research Report]
- model: sonnet
- depends_on: []

### Specialist 2
[same structure]

---

## E. Execution Groups

### Group 1: [name]
- parallel: true/false
- specialists: [list]
- estimated complexity: LOW/MEDIUM/HIGH

### Group 2: [name]
[same structure]

---

## F. Deployment Strategy
- **Target Environment**: [description]
- **Infrastructure**: [what is needed]
- **Steps**: [numbered list]
- **Rollback Plan**: [description]

---

## G. Testing Strategy
- **Unit Tests**: [approach]
- **Integration Tests**: [approach]
- **Validation Criteria**: [what constitutes success]

---

## H. Security Guardrails
[For HIGH-risk integrations: input validation, output sanitization, approval gates]

---

## I. Project Quality Hooks
[Pre-commit hooks for the tech stack, if harness_hooks enabled]

---

## J. Effort Estimation (3 Scenarios)

> Full analysis in `pipeline/03d-effort-estimation.md`. Summary below.

### Comparison Summary

| Metric | Human-Only (A) | Bridge-Only (B) | Hybrid (C) |
|--------|---------------|-----------------|------------|
| Calendar time | [X weeks] | [Y hours] | [Z days] |
| Total human hours | [A]h | [B]h supervision | [C]h |
| Token cost (USD) | $0 | $[X] | $[Y] |
| Team size (peak) | [N] people | 1 supervisor | [M] people |
| Recommendation | | | Recommended |

See `pipeline/03d-effort-estimation.md` for full role breakdowns, token discrimination, and timeline details.
