# Turbopack production build panics when `node_modules` is a symlink

Next.js 16.4.0, `next build` (default Turbopack bundler).

## Run

```bash
./setup-and-run.sh
```

The script installs dependencies into a temp directory outside the project and
replaces the project's `node_modules` with a symlink to that install, then runs
`next build`.

## Expected

The build follows the `node_modules` symlink and compiles.

## Actual

```
FATAL: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-*.log.

> Build error occurred
Error [TurbopackInternalError]: Symlink node_modules could not be resolved: the symlink target leaves the filesystem root or its parent directory could not be resolved

Debug info:
- Execution of try_get_next_package failed
- Execution of resolve failed
- Execution of resolve_internal failed
- Execution of find_package failed
- Symlink node_modules could not be resolved: the symlink target leaves the filesystem root or its parent directory could not be resolved
```

Turbopack version `e273d5b2`. Building the identical project with a real
`node_modules` directory (no symlink) succeeds.
