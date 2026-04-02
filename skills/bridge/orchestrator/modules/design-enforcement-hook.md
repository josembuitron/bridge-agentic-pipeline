# Design Enforcement Hook

Deterministic shell hooks that enforce BRIDGE presentation design rules automatically. These are NOT advisory instructions -- they are scripts that run on every Write/Edit and BLOCK violations.

## What This Enforces (mechanically verifiable rules)

| Rule | Check | Action |
|---|---|---|
| No em dashes | Grep for `\u2014` (--) in .js/.py/.md content | BLOCK with feedback |
| No npm install in clients/ | Detect `npm install` targeting clients/ path | BLOCK |
| No pip install in clients/ | Detect `pip install` targeting clients/ path | BLOCK |
| No node_modules in clients/ | Detect package.json write in clients/ | BLOCK |
| Sentence case titles | Detect Title Case patterns in slide titles | WARN |
| NODE_PATH preamble | .js files using require() must set NODE_PATH | WARN |
| Slide count limit | PPTX generation scripts with >8 addSlide() calls | WARN |

**BLOCK** = `exit(1)` stops the tool call, agent must fix.
**WARN** = `exit(2)` sends feedback to agent, does not block.

## Hook Installation

These hooks are installed during Phase 0 Step 0.4c (alongside the existing Pipeline Protection Hooks) when the user enables harness hooks.

Add to `{project-path}/.claude/settings.json` under the existing hooks configuration:

### Hook 1: No Em Dashes (PostToolUse on Write/Edit)

```json
{
  "matcher": "Write|Edit",
  "hooks": [
    {
      "type": "command",
      "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.content||i.new_string||''; if(c.includes('\\u2014')){process.stderr.write('DESIGN RULE: Em dash detected. Replace with comma, period, colon, or hyphen. Never use em dashes in BRIDGE deliverables.\\n'); process.exit(2)}\""
    }
  ]
}
```

### Hook 2: No Local Installations in Client Folders (PreToolUse on Bash)

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.command||''; const inClients=/clients\\//.test(c); const isInstall=/(npm\\s+install|pip\\s+install|yarn\\s+add)/.test(c); if(inClients && isInstall){process.stderr.write('BLOCKED: Package installation inside clients/ folder detected. All tools must be installed globally. Use /tmp/ for temp project structures.\\n'); process.exit(1)} const hasNodeModules=/(mkdir.*node_modules|package\\.json)/.test(c); const inClientsPath=/clients\\//.test(c); if(hasNodeModules && inClientsPath){process.stderr.write('BLOCKED: node_modules or package.json creation inside clients/ folder. Use global packages with NODE_PATH.\\n'); process.exit(1)}\""
    }
  ]
}
```

### Hook 3: NODE_PATH Enforcement (PostToolUse on Write)

```json
{
  "matcher": "Write",
  "hooks": [
    {
      "type": "command",
      "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const p=i.file_path||''; const c=i.content||''; if(p.endsWith('.js') && /require\\s*\\(/.test(c) && (c.includes('pptxgenjs')||c.includes('remotion')||c.includes('exceljs')||c.includes('@remotion')) && !c.includes('NODE_PATH')){process.stderr.write('DESIGN RULE: This Node.js script uses global npm packages but does not set NODE_PATH. Add this preamble at the top:\\nprocess.env.NODE_PATH = process.env.NPM_GLOBAL_PATH || require(\\\"child_process\\\").execSync(\\\"npm root -g\\\").toString().trim();\\nrequire(\\\"module\\\").Module._initPaths();\\n'); process.exit(2)}\""
    }
  ]
}
```

### Hook 4: PresentationGO Search Quality (PostToolUse on Bash)

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.command||''; if(/presentationgo/i.test(c) && /search|query|browse/i.test(c)){const generic=/(modern\\s+(business|presentation|template|slide)|professional\\s+(layout|design|template)|creative\\s+template|clean\\s+(design|template))/i; if(generic.test(c)){process.stderr.write('DESIGN RULE: PresentationGO search is too generic. Search by EXACT diagram type needed: \\\"four steps process\\\", \\\"two column comparison\\\", \\\"statistics cards\\\", \\\"six icons grid\\\". Map each slide need to a specific search query.\\n'); process.exit(2)}}\""
    }
  ]
}
```

## Complete Hook Configuration Block

The orchestrator writes this MERGED with the existing Pipeline Protection Hooks from `harness-hooks.md`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.command||''; const d=/rm\\s+-rf|git\\s+push\\s+--force|git\\s+reset\\s+--hard|DROP\\s+(TABLE|DATABASE)|kubectl\\s+delete/i; if(d.test(c)){process.stderr.write('Destructive command detected: '+c.match(d)[0]+'\\n'); process.exit(2)}\""
          },
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.command||''; const inClients=/clients\\//.test(c); const isInstall=/(npm\\s+install|pip\\s+install|yarn\\s+add)/.test(c); if(inClients&&isInstall){process.stderr.write('BLOCKED: Package installation inside clients/ folder. Install globally or use /tmp/.\\n'); process.exit(1)} if(inClients&&/(mkdir.*node_modules|package\\.json)/.test(c)){process.stderr.write('BLOCKED: node_modules/package.json in clients/. Use global packages.\\n'); process.exit(1)}\""
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const p=i.file_path||i.filePath||''; const proj=process.env.BRIDGE_PROJECT_PATH||''; if(proj&&!p.startsWith(proj)&&!p.includes('.claude/agents')&&!p.startsWith('/tmp')&&!p.startsWith('C:\\\\Users')&&!/\\/tmp\\//.test(p)){process.stderr.write('Scope escape: writing outside project dir: '+p+'\\n'); process.exit(2)}\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.content||i.new_string||''; const d=/AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{20,}|-----BEGIN (PRIVATE|RSA) KEY-----/; if(d.test(c)){process.stderr.write('Possible secret detected in output\\n'); process.exit(2)}\""
          },
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const c=i.content||i.new_string||''; if(c.includes('\\u2014')){process.stderr.write('DESIGN: Em dash found. Use comma, period, colon, or hyphen instead.\\n'); process.exit(2)}\""
          },
          {
            "type": "command",
            "command": "node -e \"const i=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}'); const p=i.file_path||''; const c=i.content||''; if(p.endsWith('.js')&&/require\\s*\\(/.test(c)&&(c.includes('pptxgenjs')||c.includes('remotion')||c.includes('exceljs'))&&!c.includes('NODE_PATH')){process.stderr.write('DESIGN: Script uses global npm packages without NODE_PATH preamble. Add NODE_PATH setup.\\n'); process.exit(2)}\""
          }
        ]
      }
    ]
  }
}
```

## What These Hooks CANNOT Enforce (requires agent self-evaluation)

| Rule | Why not hookable | How it's enforced instead |
|---|---|---|
| "Is the image industry-relevant?" | Subjective judgment | Agent self-eval + Image Selection Protocol |
| "Is the slide visual-first?" | Requires layout analysis | Prompt instructions + slide type template |
| "Does the deck have the WOW effect?" | Fully subjective | Design Director agent + user approval gate |
| "Is PresentationGO layout well recreated?" | Requires visual comparison | Agent views thumbnail grid |
| "Are brand colors correctly applied?" | Would need to parse PPTX binary | Agent verifies via thumbnail QA |

**Mechanical rules get hooks. Subjective rules get agent prompts + human gates.**

## Hookify Implementation Status

The following design rules are NOW implemented as hookify files and enforced automatically (regardless of harness hook mode):

| Rule | Hookify File | Scope | Status |
|---|---|---|---|
| Em dashes + Title Case | `~/.claude/hookify.bridge-em-dash-titlecase.local.md` | Global | ACTIVE |
| Client folder install guard | `.claude/hookify.bridge-client-install-guard.local.md` | Project | ACTIVE |
| NODE_PATH preamble | `.claude/hookify.bridge-node-path.local.md` | Project | ACTIVE |
| Taint tag cleanup | `.claude/hookify.bridge-taint-cleanup.local.md` | Project | ACTIVE |
| Destructive commands | `~/.claude/hookify.bridge-destructive.local.md` | Global | ACTIVE (upgraded with composite detection) |

**These hookify files provide ALWAYS-ON enforcement (warn mode).** They do not require harness hooks to be enabled.

## Integration with Harness Hooks (settings.json)

This module also defines JSON hook configurations (above) for installation into `.claude/settings.json`. These provide ADDITIONAL enforcement when harness hooks are enabled in Phase 0:

**Installation flow:**
1. Phase 0 Step 0.4b: User opts into harness hooks (warn or enforce mode)
2. Phase 0 Step 0.4c: Orchestrator writes hooks to `.claude/settings.json`
3. In `enforce` mode, the settings.json hooks use `exit(1)` to BLOCK violations (stronger than hookify warn)
4. The hookify files provide baseline coverage even when harness hooks are OFF

**Layered enforcement:**
- Hookify files = always-on baseline (warn, never block)
- Harness hooks OFF = only hookify coverage
- Harness hooks WARN = hookify + settings.json warnings
- Harness hooks ENFORCE = hookify + settings.json BLOCKING
