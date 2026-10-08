# next dev writes agent instructions pointing at a docs path that does not exist under Yarn PnP

Next.js 16.4.0 ships its framework guides at `next/dist/docs/`, and `next dev`
writes an `AGENTS.md` block telling the coding agent to:

> Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory...)

That path is hardcoded. With Yarn Plug'n'Play (the default for Yarn 2+ without
`nodeLinker: node-modules`) there is no `node_modules` directory at all, so the
instructed docs directory — and every guide in it — is unreadable to an agent
that uses plain filesystem reads. The 512 doc entries only exist inside the Yarn
zip cache (`~/.yarn/berry/cache/next-npm-16.4.0-*.zip`).

## Steps

```bash
corepack enable
yarn install
yarn dev            # starts next dev, generates AGENTS.md, then Ctrl+C
yarn repro
```

## Observed

```
✓ Generated AGENTS.md for AI agents. Set `agentRules: false` in next.config to disable.

instructed docs path: node_modules/next/dist/docs/
exists on disk: false
markdown guides found: 0
```

## Expected

The generated instructions should name a location the agent can actually read
(e.g. resolved via `require.resolve('next/package.json')`), or the guides should
be exposed on disk for non-`node_modules` installs.

## Control

With npm (`npm i next@16.4.0`) the same instruction block is written and
`node_modules/next/dist/docs/` **does** exist (`01-app`, `02-pages`,
`03-architecture`, `04-community`, `index.md`), so the package itself is not
missing the docs; only the instructed path is wrong for PnP installs.
