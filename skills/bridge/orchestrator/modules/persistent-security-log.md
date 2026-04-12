# Persistent Security Event Log Module

Structured, append-only security event logging in JSON Lines format. Replaces the ephemeral `security-events.log` text file with a machine-parseable, permanent record.

**Problem solved:** In warn mode, security warnings were ephemeral -- visible only in the agent's output, lost after context compression. This module ensures every security-relevant event is permanently recorded.

---

## Log File

**Path:** `pipeline/security-events.json` (JSON Lines format -- one JSON object per line)

**Why JSON Lines (not array)?** Append-only is critical. JSON arrays require reading the entire file, parsing, appending, and rewriting. JSONL allows `echo '{...}' >> file` without parsing. This is important because security logs must never be lost due to a write failure mid-array.

---

## Event Schema

Every event follows this structure:

```json
{
  "id": "{auto-increment integer}",
  "timestamp": "{ISO-8601 with timezone}",
  "phase": "{0|0b|1|2|3|4|5}",
  "agent": "{agent name or 'orchestrator'}",
  "category": "{category from table below}",
  "severity": "{INFO|WARN|BLOCK|OVERRIDE}",
  "event": "{human-readable description}",
  "details": {},
  "user_action": "{approve|deny|skip|null}"
}
```

## Event Categories

| Category | When logged |
|----------|-----------|
| `hook_trigger` | Any pipeline hook fires (destructive cmd, secrets, scope escape) |
| `supply_chain` | Package install: scan result, approval, block, override |
| `tool_install` | Tool installed or updated (what, from where, version) |
| `web_access` | External URL accessed via crawl4ai, Playwright, WebFetch |
| `taint_detected` | External content matched against command (WARN-04) |
| `config_change` | Any change to pipeline/config.json |
| `gate_decision` | Human approval at phase gate (approve, reject, modify, stop) |
| `security_gate` | Phase 5 security gate result (blocking/advisory) |
| `risk_override` | User overrides a security warning or block |
| `sbom_update` | SBOM generated or updated |
| `version_check` | Version pinning check result |

---

## Logging Protocol

### Who Writes

The **orchestrator** is the ONLY writer to `pipeline/security-events.json`. Agents do NOT write directly. Instead:

1. Agents include security events in their output (structured section at the end)
2. The orchestrator reads agent output at each approval gate
3. The orchestrator batch-writes all events from that phase

This prevents concurrent write conflicts and ensures consistent event IDs.

### How to Write (Orchestrator Protocol)

At each phase completion, BEFORE presenting the approval gate:

```
1. Read agent output for security-relevant events
2. Read hook warnings from the phase (if any)
3. For each event:
   a. Assign next sequential ID
   b. Construct JSON object per schema
   c. Append to pipeline/security-events.json as a single line
4. If no events: do not write (no empty entries)
```

### Hash Chain Integrity (AI-SAFE2 P2.T3 -- tamper-proof storage)

Each event includes a `prev_hash` field containing the SHA-256 hash of the previous line. This creates a verifiable chain -- if any line is modified or deleted, the chain breaks.

**Computing the hash (orchestrator protocol):**
1. Read the last line of `pipeline/security-events.json`
2. Compute `SHA-256(last_line_bytes)` and encode as hex
3. Include as `"prev_hash": "{hex}"` in the new event
4. If the file is empty or unreadable: use `"prev_hash": "GENESIS"` (first entry)
5. If reading fails unexpectedly: use `"prev_hash": "CHAIN_BROKEN"` and continue writing -- the log must NEVER be blocked by an integrity failure

**Verification:** Phase 5 Validator can verify the chain by reading each line, hashing it, and comparing to the next line's `prev_hash`. A `CHAIN_BROKEN` entry is a WARNING, not a failure -- it means one write could not verify the chain but the log continued.

**Append pattern (Bash):**
```bash
# With hash chain (orchestrator computes prev_hash before appending)
echo '{"id":1,"timestamp":"2026-04-06T10:00:00Z","phase":"0","agent":"orchestrator","category":"tool_install","severity":"INFO","event":"Installed crawl4ai 0.8.0 via pip","details":{"package":"crawl4ai","version":"0.8.0","method":"pip"},"user_action":null,"prev_hash":"GENESIS"}' >> pipeline/security-events.json
```

### Phase 0 Special Handling

During Phase 0, `pipeline/` may not exist yet. Write to `/tmp/bridge-security-events-{session}.jsonl` then move to `pipeline/security-events.json` after Step 0.3 creates the project directory.

---

## Reading the Log

### Phase 5 Validator

The validator reads `pipeline/security-events.json` and reports:
- Total events by category and severity
- Any BLOCK events that were overridden (risk acceptance)
- Any WARN events that were not acknowledged
- Summary included in `pipeline/05-validation-report.md` under "Security Event Summary"

### Audit Trail

The security event log combined with `pipeline/approval-log.json` provides a complete audit trail:
- `security-events.json`: what happened (technical events)
- `approval-log.json`: what the user decided (business decisions)

Together they answer: "Who approved what, when, and with what security context?"

---

## Retention

- The log is never truncated during a pipeline run
- On pipeline completion: log remains in `pipeline/` for the project record
- On pipeline rollback: log entries are NOT rolled back (they document history, including rolled-back phases)
- The log is gitignored by default (contains operational data, not source code)

---

## Migration from security-events.log

The old text-based `security-events.log` (plain text, batch write per phase) is replaced by this module. The orchestrator:
- Writes to `security-events.json` (new, structured)
- Does NOT write to `security-events.log` (deprecated)
- If `security-events.log` exists from a previous run: leave it, do not delete
