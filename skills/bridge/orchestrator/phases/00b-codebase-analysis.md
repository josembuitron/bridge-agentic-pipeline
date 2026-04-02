# Phase 0b: Existing Codebase Analysis (CONDITIONAL)

## Trigger

Run this phase ONLY if user input references an existing codebase. Detection keywords:
- "add to", "integrate with", "modify", "extend", "upgrade", "migrate"
- References a repo URL, local path, or "this repo"
- "existing system", "current codebase", "legacy"

If none of these are detected, skip to Phase 1.

---

## Step 0b.1 - Locate Codebase

Ask user via AskUserQuestion:
- **Local path** -- Path to existing codebase
- **GitHub repo URL** -- Will clone via `gh repo clone`
- **This same repo** -- Codebase is in the current working directory
- **Multiple repos** -- User provides paths/URLs for each

If GitHub URL: clone to a temp location and analyze.

---

## Step 0b.2 - Run Codebase Scan

Spawn a `general-purpose` agent with description:
`[Phase 0b] Codebase Analyzer -- Scanning existing codebase structure`

Agent performs:

### Structure Analysis
```bash
# File tree (max 3 levels deep)
find {codebase-path} -maxdepth 3 -type f | head -200 | sort

# Language/framework detection
ls {codebase-path}/package.json {codebase-path}/requirements.txt {codebase-path}/Cargo.toml \
   {codebase-path}/go.mod {codebase-path}/pom.xml {codebase-path}/Gemfile 2>/dev/null

# LOC count
find {codebase-path} -name '*.ts' -o -name '*.js' -o -name '*.py' -o -name '*.go' | \
  xargs wc -l 2>/dev/null | tail -1
```

### Configuration Analysis
- Read key config files: tsconfig.json, .env.example, docker-compose.yml, Dockerfile
- Identify: package versions, environment variables, service dependencies

### Architecture Pattern Detection
- Monolith vs microservices vs serverless (from folder structure + config)
- Key entry points (main files, API routes, handlers)
- Database setup (ORM config, migrations folder)
- Test setup (test framework, coverage config)

### Integration Points
- External API calls (grep for fetch, axios, http.get, requests.get)
- Database connections (connection strings, ORM models)
- Message queues, caches, external services

### Code Intelligence (if Serena MCP available)
- `get_symbols_overview "src/"` -- full symbol map
- `find_symbol` for key classes/interfaces

---

## Step 0b.3 - Produce Analysis

Write to `pipeline/00b-codebase-analysis.md`:

```markdown
# Existing Codebase Analysis

## Tech Stack
- Language: {language + version}
- Framework: {framework + version}
- Database: {database type}
- Test Framework: {test runner + coverage tool}
- Build Tool: {bundler/compiler}
- Package Manager: {npm/yarn/pip/cargo}

## Architecture Pattern
{monolith/microservices/serverless} -- {evidence}

## Key Entry Points
- {file}: {description}

## Integration Points
- {system}: {how it connects, auth method}

## Database Schema (key entities)
- {entity}: {description}

## Testing Setup
- Framework: {name}
- Coverage: {percentage if available}
- Test count: {number}

## Constraints from Existing Code
- MUST use {framework version} (locked in package.json)
- MUST maintain {API contract} (external consumers depend on it)
- CANNOT change {database schema} without migration

## File Statistics
- Total files: {count}
- LOC: {count}
- Languages: {breakdown}
```

---

## Step 0b.4 - Pass to Downstream Phases

Include in Phase 1 (Translator) agent prompt:
```
## Existing Codebase Context
This is a BROWNFIELD project. The user has an existing codebase.
Read: pipeline/00b-codebase-analysis.md
Requirements MUST be compatible with the existing system.
Do NOT propose replacing existing components unless the user explicitly requests it.
```

Include in Phase 3 (Architect) agent prompt:
```
## Existing Codebase Constraint
This is a BROWNFIELD project. Read: pipeline/00b-codebase-analysis.md
Your architecture MUST work within the existing system:
- Use the same language/framework versions
- Maintain existing API contracts
- Follow existing patterns (naming, structure, test approach)
- New code integrates with existing code, does not replace it
```
