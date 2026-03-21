---
name: semgrep
description: >
  Static analysis security scanning via semgrep CLI. Use for SAST security audits,
  OWASP Top 10 detection, code quality rules, and vulnerability scanning.
  Trigger on: "security scan", "check for vulnerabilities", "SAST", "OWASP",
  "find security issues", "scan for injection", "code security audit",
  or any request to validate code security before deployment.
---

# semgrep -- Static Analysis Security Scanner

semgrep scans code for security vulnerabilities, bugs, and anti-patterns using pattern-matching rules.

## Quick Commands

```bash
# Scan current directory with recommended rules
semgrep scan --config auto

# Scan specific directory
semgrep scan --config auto src/

# Scan for OWASP Top 10 only
semgrep scan --config "p/owasp-top-ten"

# Scan specific language
semgrep scan --config auto --lang python src/

# Output as JSON (for pipeline processing)
semgrep scan --config auto --json > semgrep-results.json

# Scan with specific severity threshold
semgrep scan --config auto --severity ERROR
```

## Common Rule Packs

| Pack | Command | Covers |
|------|---------|--------|
| Auto (recommended) | `--config auto` | Best rules for detected languages |
| OWASP Top 10 | `--config "p/owasp-top-ten"` | Injection, XSS, SSRF, etc. |
| Secrets | `--config "p/secrets"` | Hardcoded credentials, API keys |
| Python security | `--config "p/python"` | Python-specific vulnerabilities |
| JavaScript | `--config "p/javascript"` | JS/TS vulnerabilities |
| SQL injection | `--config "p/sql-injection"` | SQL injection patterns |

## Pipeline Integration

For the Validator agent, run after code is built:
```bash
semgrep scan --config auto --json src/ > pipeline/semgrep-results.json
```

Parse results to feed into quality_score security component.
