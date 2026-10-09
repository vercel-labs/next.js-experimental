# next build fails when the project dir is spelled with different casing (Windows)

Next.js 16.4.0, App Router, webpack (`next build --webpack`).

On Windows, running `npm run build` from a shell whose cwd spelling differs in
casing from the real directory (`c:\dev\portfolio` vs `C:\Dev\portfolio`) makes
webpack key application modules under one spelling and the framework/React
modules under the other. Static prerendering then dies with "Invalid hook call"
/ `Cannot read properties of null (reading 'useContext')` on `/`,
`/_not-found` and `/_global-error`.

Root cause pointer: `next/dist/lib/get-project-dir.js` returns
`realpathSync(resolvedDir)`, and `next/dist/lib/realpath.js` uses the *JS*
`fs.realpathSync` on win32 (`fs.realpathSync.native` everywhere else). The JS
implementation does not canonicalize casing on Windows, so the mis-cased path
is used for the whole build (the "Invalid casing detected for project dir"
warning cannot even fire there, because `resolvedDir === realDir`).

## Reproduce on Windows

1. `npm install`
2. `cd` into the project using a different casing than on disk, e.g.
   `cd c:\dev\portfolio` when the folder is `C:\Dev\portfolio`.
3. `npm run build`

## Reproduce on Linux/macOS

```
npm install
npm run repro           # fails: Invalid hook call during prerender
npm run repro:control   # same build via the canonical spelling: passes
```

`repro.mjs` points `next build` at a case-variant spelling of the project
directory and preloads `emulate-windows-realpath.cjs`, which makes
`fs.realpathSync` a no-op so POSIX matches the Windows realpath behavior
described above. Nothing else is patched; the control run uses the identical
shim and succeeds.

## Expected

The build resolves one canonical path for framework modules and prerenders.

## Actual

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
...
Error occurred prerendering page "/". TypeError: Cannot read properties of null (reading 'useContext')
    at OuterLayoutRouter (webpack://.../src/client/components/layout-router.tsx:531:19)
Export encountered errors on 3 paths:
	/_global-error/page: /_global-error
	/_not-found/page: /_not-found
	/page: /
```

## Note

On a case-sensitive filesystem the trigger generalizes to "the project dir
string handed to `next build` is not the canonical path of that directory";
Windows' case-insensitive realpath is just the common way to get there through
`npm run build`.
