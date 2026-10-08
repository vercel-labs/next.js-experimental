#!/usr/bin/env bash
# Reproduces: Turbopack production build panics when node_modules is a symlink
# "Symlink node_modules could not be resolved: the symlink target leaves the
#  filesystem root or its parent directory could not be resolved"
set -eux
HERE="$(cd "$(dirname "$0")" && pwd)"
STORE="$(mktemp -d)/install"   # simulates an install on another mount/location

# 1. install deps somewhere outside the project
mkdir -p "$STORE"
cp "$HERE/package.json" "$STORE/package.json"
(cd "$STORE" && npm install --no-audit --fund=false)

# 2. point the project's node_modules at that external install
rm -rf "$HERE/node_modules"
ln -s "$STORE/node_modules" "$HERE/node_modules"

# 3. production build with the default Turbopack bundler -> FATAL panic
cd "$HERE"
node node_modules/next/dist/bin/next build
