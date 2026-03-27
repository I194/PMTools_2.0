#!/usr/bin/env bash
set -euo pipefail

echo "=== PMTools 2.0 — dev environment setup ==="

# Check Node version
REQUIRED_NODE="22"
CURRENT_NODE=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$CURRENT_NODE" != "$REQUIRED_NODE" ]; then
  echo "⚠ Node $REQUIRED_NODE required, found $(node -v). Run: nvm use"
  exit 1
fi

# Install dependencies
echo "→ Installing dependencies..."
npm ci --silent

# Type check
echo "→ Running type check..."
npx tsc --noEmit

# Lint check
echo "→ Running lint..."
npm run lint 2>/dev/null && echo "  ✓ lint passed" || echo "  ⚠ lint warnings found"

echo ""
echo "=== Setup complete ==="
echo "Run 'npm start' to launch dev server on localhost:3000"
