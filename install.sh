#!/bin/bash
# BRIDGE Pipeline -- Installer
# Developed by Jose Milton Buitron -- https://github.com/josembuitron

set -e
REPO="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║      BRIDGE Development Pipeline     ║"
echo "  ║      by Jose Milton Buitron          ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Install skill files ──────────────────────────────
echo "[1/3] Installing skill files..."
mkdir -p ~/.claude/skills ~/.claude/agents

cp -r "$REPO/skills/bridge"    ~/.claude/skills/bridge
cp -r "$REPO/templates"        ~/.claude/skills/bridge/templates
cp -r "$REPO/docs"             ~/.claude/skills/bridge/docs
cp -r "$REPO/agents/"*         ~/.claude/agents/ 2>/dev/null || true

echo "  ✓ Skill installed to ~/.claude/skills/bridge"
echo "  ✓ Agents installed to ~/.claude/agents"

# ── Step 2: Verify critical tools ────────────────────────────
echo ""
echo "[2/3] Checking tools..."

MISSING=()

# Node.js (required)
if command -v node &>/dev/null; then
  echo "  ✓ Node.js $(node -v)"
else
  MISSING+=("Node.js 18+ -- https://nodejs.org")
fi

# Python (required)
if command -v python3 &>/dev/null || command -v python &>/dev/null; then
  PY=$(python3 --version 2>/dev/null || python --version 2>/dev/null)
  echo "  ✓ $PY"
else
  MISSING+=("Python 3.10+ -- https://python.org")
fi

# pip (required for crawl4ai/semgrep)
if command -v pip &>/dev/null || command -v pip3 &>/dev/null; then
  echo "  ✓ pip available"
else
  MISSING+=("pip -- install with: python -m ensurepip --upgrade")
fi

# crawl4ai (critical -- primary doc research)
if command -v crwl &>/dev/null; then
  echo "  ✓ crawl4ai (crwl)"
else
  echo "  ○ crawl4ai not found -- installing..."
  pip install -U crawl4ai 2>/dev/null && crawl4ai-setup 2>/dev/null && echo "  ✓ crawl4ai installed" || MISSING+=("crawl4ai -- pip install -U crawl4ai && crawl4ai-setup")
fi

# semgrep (critical -- security scanning)
if command -v semgrep &>/dev/null; then
  echo "  ✓ semgrep $(semgrep --version 2>/dev/null | head -1)"
else
  echo "  ○ semgrep not found -- installing..."
  pip install semgrep 2>/dev/null && echo "  ✓ semgrep installed" || MISSING+=("semgrep -- pip install semgrep")
fi

# gh CLI (high-value -- GitHub integration)
if command -v gh &>/dev/null; then
  echo "  ✓ gh CLI $(gh --version 2>/dev/null | head -1)"
else
  echo "  ○ gh CLI not found (optional -- needed for PR reviews)"
fi

# eslint (installed per-project, just check npm)
if command -v npx &>/dev/null; then
  echo "  ✓ npx available (eslint/vitest will install per-project)"
else
  MISSING+=("npx -- comes with Node.js, verify your PATH")
fi

# ── Step 3: Report ───────────────────────────────────────────
echo ""
echo "[3/3] Summary"
echo ""

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "  All tools ready. BRIDGE will run at full capability."
else
  echo "  ⚠ Missing tools (install for full pipeline capability):"
  echo ""
  for tool in "${MISSING[@]}"; do
    echo "    → $tool"
  done
  echo ""
  echo "  BRIDGE will still work, but some features will be limited."
fi

echo ""
echo "  ┌─────────────────────────────────────┐"
echo "  │  Restart Claude Code, then type:    │"
echo "  │                                     │"
echo "  │    /bridge                          │"
echo "  │                                     │"
echo "  └─────────────────────────────────────┘"
echo ""
