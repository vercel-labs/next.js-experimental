# Repro: typecheck still imports a deleted route-group layout until route types are regenerated

Next.js `16.4.0` · App Router · `typedRoutes: true` · Turbopack dev.

## Run

```bash
npm install
./repro.sh
```

The script is self-contained and deterministic (it creates and deletes the route group itself).

## Steps it performs

1. `next dev --turbopack` with `typedRoutes: true`.
2. Add `app/(group)/layout.tsx` (a route group with **no page**); the dev server regenerates
   `.next/dev/types/validator.ts`, which now contains
   `import("../../../app/(group)/layout.js")`.
3. `tsc --noEmit` → exit 0.
4. Stop the dev server, then delete `app/(group)/`.
5. `tsc --noEmit` again, without regenerating route types → **fails**:

```
.next/dev/types/validator.ts(70,39): error TS2307: Cannot find module '../../../app/(group)/layout.js' or its corresponding type declarations.
.next/dev/types/validator.ts(78,69): error TS2344: Type '__InvalidParamMatchingKeys' does not satisfy the constraint 'never'.
  Type 'string' is not assignable to type 'never'.
```

6. Start `next dev` again (route types regenerated) and `tsc --noEmit` → exit 0, with no
   application code change.

## Notes

* `tsconfig.json` includes `.next/dev/types/**/*.ts` (added automatically by Next.js), so the
  stale generated `validator.ts` is part of the typecheck.
* If the dev server is *running* while the layout is deleted, the generated types are updated
  and the typecheck stays green. The stale state only persists when the file disappears while
  the dev server is not running (branch switch, `git clean` of app code, CI typecheck over a
  cached `.next`).
