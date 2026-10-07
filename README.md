# Repro: `cache-components-instant-false` codemod modifies test files beside pages

The codemod's filename matcher accepts any extension after `page.` / `layout.` / `default.`,
so colocated `page.test.tsx`, `layout.test.tsx`, `page.spec.tsx`, `page.stories.tsx` files
are treated as route segments and get `export const instant = false` inserted.

## Run

```bash
./run.sh
```

(or manually)

```bash
git init -q . && git add -A && git -c user.email=a@b -c user.name=r commit -qm init
npx @next/codemod@16.4.0 cache-components-instant-false ./app
git diff --stat
```

## Expected

Only `app/page.tsx`, `app/layout.tsx`, `app/dashboard/page.tsx` are modified (3 files).

## Actual

All 7 files are modified (`7 ok`), including `app/page.test.tsx`, `app/layout.test.tsx`,
`app/dashboard/page.spec.tsx` and `app/blog/page.stories.tsx`.

Reproduced with `@next/codemod@16.4.0` and `@next/codemod@16.5.0-canary.2`.

Cause: `packages/next-codemod/transforms/cache-components-instant-false.ts`

```
/(^|[/\\])app[/\\](?:.*[/\\])?(page|layout|default)\.[^/\\]+$/
```

`[^/\\]+` matches `test.tsx`, so `page.test.tsx` matches. The transform does not
consult `pageExtensions`.
