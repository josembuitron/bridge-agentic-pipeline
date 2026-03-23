#!/bin/bash
# BRIDGE Pipeline — One-command installer
# After running: restart Claude Code, then type /bridge

set -e
REPO="$(cd "$(dirname "$0")" && pwd)"

echo "Installing BRIDGE Pipeline..."
mkdir -p ~/.claude/skills ~/.claude/agents

# Core skill + templates + docs + agents — everything BRIDGE needs
cp -r "$REPO/skills/bridge"    ~/.claude/skills/bridge
cp -r "$REPO/templates"        ~/.claude/skills/bridge/templates
cp -r "$REPO/docs"             ~/.claude/skills/bridge/docs
cp -r "$REPO/agents/"*         ~/.claude/agents/ 2>/dev/null || true

echo ""
echo "Done! Restart Claude Code and type: /bridge"
