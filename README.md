# Repro: create-next-app omits next-steps commands for built-in templates (#99766)

Issue: https://github.com/vercel/next.js/issues/99766

## Run

```bash
bash repro.sh
```

Requires network access (downloads `create-next-app@canary`). No OS-specific
behavior involved; reproduces on Linux/macOS/Windows.

## Observed with create-next-app 16.5.0-canary.1

Built-in template run ends right after `Success!`:

```
Success! Created test-app at /tmp/.../test-app

```

`--example hello-world` run prints the full block:

```
Success! Created example-app at /tmp/.../example-app
Inside that directory, you can run several commands:

  npm run dev
...
```

The generated template app *does* contain `package.json`, so the omission is
not caused by a missing manifest.

## Cause

`packages/create-next-app/create-app.ts`: `hasPackageJson` is initialized to
`false` and only assigned in the `if (example)` branch
(`hasPackageJson = existsSync(packageJsonPath)`). The `else` branch that calls
`installTemplate()` never sets it, so the final
`if (hasPackageJson) { ... }` block is skipped for every template-based
scaffold.
