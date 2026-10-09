#!/usr/bin/env bash
set -euo pipefail
npm install
npm install --no-save @vercel/next@22.0.0
npx next build
node harness/gen.js
node harness/invoke.js
