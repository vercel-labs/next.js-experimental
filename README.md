# Cache Components / PPR: disk cache lost after `next start` restart

Hardened fork of the reporter's reproduction for
https://github.com/vercel/next.js/issues/99741 (next@16.4.0-canary.63, Node 24, Linux).

```sh
npm install
./repro-case-a.sh   # runtime-upgraded PPR page is lost on restart
./repro-case-b.sh   # HTML regenerated, RSC payload stale at build-time data
```

The original `repro.sh` is kept as `repro-original.sh`; it is timing-sensitive
(the restart can land after `revalidate` has elapsed, which hides case A behind a
`STALE` response). The two scripts above pin the timing.

## Observed (next@16.4.0-canary.63)

Case A:
```
/en/p/a #1 (fallback shell)              at=1791310835858  x-nextjs-postponed: 1
/en/p/a #2 (upgraded, HIT)               at=1791310835858  x-nextjs-cache: HIT
-- disk files written for /en/p/a (no a.rsc): a.html a.meta a.segments
== restart next start immediately
/en/p/a after restart                    at=1791310840186  x-nextjs-postponed: 1   <-- re-rendered
```

Case B:
```
/en HTML build-time                      at=1791310878210  x-nextjs-cache: HIT
/en HTML regenerated                     at=1791310890746  x-nextjs-cache: HIT
/en RSC  regenerated                     at=1791310890746  x-nextjs-cache: HIT
== restart next start
/en HTML after restart                   at=1791310890746  x-nextjs-cache: HIT
/en RSC  after restart                   at=1791310878210  x-nextjs-cache: HIT     <-- build-time data
```

## Source correlation

`server/lib/incremental-cache/file-system-cache.ts`:

* `set()` writes `${key}.rsc` only when `!ctx.isFallback && !ctx.isRoutePPREnabled`,
  so a complete (non-postponed) entry for a PPR route never gets its `.rsc` sidecar.
* `get()` reads `${key}.rsc` when `!ctx.isFallback && (!ctx.isRoutePPREnabled || meta.postponed == null)`.
  The read throws ENOENT, the surrounding `try/catch` returns `null`, and the route is
  treated as a cache miss -> the fallback shell is served and re-rendered.
