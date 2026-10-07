# `bun --bun run ./node_modules/.bin/next dev` — App Router dev server (Next.js 16.4.0, Turbopack)

Harness for DX feedback #11 ("App Router pages 500 with ENOENT build-manifest under a nested
`bun --bun` dev script").

## Install

```bash
npm install          # or: bun install
```

## Run

```bash
npm run dev:bun      # bun --bun run ./node_modules/.bin/next dev --port 3000
curl -i http://localhost:3000/            # App Router page
curl -i http://localhost:3000/api/hello   # App Router route handler
```

Baseline for comparison: `npm run dev:node`.

## What was observed in this harness (Linux x64, Next.js 16.4.0, Turbopack)

1. With `typescript` / `@types/*` NOT installed (the state right after `npm install` here),
   `npm run dev:bun` dies during startup: Next.js auto-installs the TypeScript deps by spawning
   `npm` (Node.js), which inherits `NODE_OPTIONS=--bun` set by `bun --bun`, and Node refuses it:

   ```
   node: --bun is not allowed in NODE_OPTIONS
   Failed to install required TypeScript dependencies, please install them manually to continue:
   Unhandled Rejection: { command: "npm install --save-exact --save-dev typescript @types/react @types/node" }
   ```

   Both `/` and `/api/hello` are then unreachable (connection refused).

2. After `npm install --save-dev typescript @types/react @types/node`, the same `bun --bun`
   dev script serves `/` and `/api/hello` with HTTP 200, with
   `.next/dev/build-manifest.json` and `.next/dev/server/app/page/build-manifest.json` present.
   The reported 500 + ENOENT build-manifest did not occur with bun 1.2.21, 1.3.0 or 1.4.2,
   with or without `cacheComponents`, `'use cache'`, `generateStaticParams`, a Pages Router
   page, a cold/warm `.next/dev`, or a `.next/dev` first produced by a Node.js dev run.
