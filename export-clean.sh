#!/bin/bash
# Export a clean copy of the BRIDGE Pipeline skill (no project data)
# Usage: bash export-clean.sh [destination-path]

DEST="${1:-./daai-dev-workflow-clean}"

echo "Exporting clean skill to: $DEST"

# Create destination
mkdir -p "$DEST"

# Copy everything except project data, runtime caches, and local state
rsync -av --progress \
  --exclude='projects/' \
  --exclude='.superpowers/' \
  --exclude='.crawl4ai/' \
  --exclude='node_modules/' \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db' \
  ./ "$DEST/"

# Create empty projects directory with a README
mkdir -p "$DEST/projects"
cat > "$DEST/projects/README.md" << 'EOF'
# Projects Directory

Pipeline runs create project folders here automatically.
Each project follows the structure:

```
{YYYY-MM-DD}-{project-slug}/
├── input/          ← Original requirement
├── pipeline/       ← Internal pipeline artifacts
├── src/            ← Built solution code
├── tests/          ← Test suites
├── docs/           ← Technical documentation
└── deliverables/   ← Client-facing documents
```
EOF

echo ""
echo "Done! Clean skill exported to: $DEST"
echo ""
echo "What was excluded:"
echo "  - projects/ (your project data)"
echo "  - .superpowers/ (local brainstorm sessions)"
echo "  - .crawl4ai/ (scraped doc cache)"
