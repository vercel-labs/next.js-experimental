# DX feedback #14 — "Client lazy compilation emits conflicting assets when opening a deferred UI"

Attempted reproduction of the anonymized report: Next.js 16.4.0, `next dev --turbopack`,
Turbopack **client lazy dynamic compilation**, `React.lazy` / `next/dynamic` deferred UI with a
Markdown renderer that lazily loads **syntax highlighting (shiki)** and **diagram (mermaid)** chunks,
Cache Components enabled, clean cache, authenticated page, then open the deferred UI.

Reported failure (not observed here): Turbopack issue
`Two or more assets with different content were emitted to the same output path`
(`EmitConflictIssue`, `crates/next-core/src/emit.rs`) for the syntax-highlighting and diagram chunks,
plus related API requests returning 500.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm run repro          # clean .next, next dev --turbopack on :3000
npm run drive          # Playwright: load the page with a session cookie, open the deferred UI
npm run drive:race     # 3 concurrent tabs + reload mid-compile, to race two lazy activations
```

`app/markdown.tsx` is loaded through `React.lazy` + `next/dynamic` and renders `streamdown`,
whose internal `import('./highlighted-body-*.js')` (shiki) and `import('./mermaid-*.js')` (mermaid)
plus an app-level `import('mermaid')` are all compiled lazily on first open.

Config knobs under test (`next.config.ts`):

```ts
cacheComponents: true,
partialPrefetching: true,
experimental: {
  turbopackLazyDynamicImports: true,
  turbopackLazyDynamicImportsSSR: true, // also tried: false
}
```

## Observed on next@16.4.0 (and next@16.5.0-canary.1)

Opening the deferred UI compiles and serves every lazy chunk with HTTP 200, highlights the code
block, renders the mermaid diagram, and `/api/data` answers 200. No `EmitConflictIssue`, no 500s,
across clean-cache runs with `turbopackLazyDynamicImportsSSR` both `true` and `false`, and with
concurrent tabs/reloads during the first compile.

Served lazy-compilation chunk requests (all 200), e.g.:

```
/_next/static/chunks/app_markdown_tsx_lazy-compilation-5f0a4589b78905a4_*.js
/_next/static/chunks/node_modules_streamdown_dist_highlighted-body-KQOG7T2V_*.js
/_next/static/chunks/node_modules_streamdown_dist_mermaid-MCJ5UELQ_*.js
/_next/static/chunks/1daa_mermaid_dist_mermaid_core_mjs_lazy-compilation-5de8e25b6c738408_*.js
```

The reporter's project source is not available, so the exact chunk layout that collides is unknown.
