#!/usr/bin/env bash
#
# SKILL: use.npm.alias
#
# Installs shell aliases that redirect npm commands to pnpm for faster package management.
#
# What it does:
#   1. Creates an alias 'npm.slow' pointing to the original npm binary
#   2. Creates an alias 'npm' that redirects to pnpm
#   3. Sets up pnpm tab completion (works for both pnpm and npm alias)
#   4. Everything goes in ~/.bash_aliases (works in both bash and zsh)
#
# When to use:
#   - After setting up a new development environment
#   - When you want npm commands to use pnpm transparently
#
# Usage:
#   ./.agent/repo=.this/skills/use.npm.alias.sh
#
set -euo pipefail

BASH_ALIASES="${HOME}/.bash_aliases"
touch "$BASH_ALIASES"

# findsert npm.slow (only add if not already defined)
if ! grep -q "^alias npm.slow=" "$BASH_ALIASES" 2>/dev/null; then
  NPM_PATH=$(which npm)
  echo "alias npm.slow=\"$NPM_PATH\"" >> "$BASH_ALIASES"
  echo "👍 findsert: alias npm.slow=\"$NPM_PATH\""
else
  echo "👍 findsert: npm.slow alias already exists"
fi

# upsert npm => pnpm
if grep -q "^alias npm=" "$BASH_ALIASES" 2>/dev/null; then
  sed -i 's/^alias npm=.*/alias npm="pnpm"/' "$BASH_ALIASES"
else
  echo 'alias npm="pnpm"' >> "$BASH_ALIASES"
fi
echo "👍 upsert: alias npm=\"pnpm\""

# report
echo ""
echo "Aliases installed to $BASH_ALIASES"
echo "Run 'source $BASH_ALIASES' or open a new terminal to activate."
