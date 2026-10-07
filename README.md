# Repro: eslint-config-next@16.5.0-canary.2 crashes ESLint (zod-validation-error/v4 missing)

```
pnpm install
pnpm lint
```

Expected: ESLint lints the app.
Actual:

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './v4' is not defined by "exports"
in node_modules/.pnpm/eslint-plugin-react-hooks@7.1.1_.../node_modules/zod-validation-error/package.json
```

Cause: `eslint-config-next@16.5.0-canary.2` -> `eslint-plugin-react-hooks@^7.1.0`, which
`require()`s `zod-validation-error/v4` but declares `zod-validation-error: ^3.5.0 || ^4.0.0`.
`zod-validation-error@3.5.4` satisfies that range and **removed** the `./v4` export
(3.5.0-3.5.3 and 4.x have it). Any app that pulls `zod-validation-error@3.5.x` (direct dep here,
or an older entry kept by an existing pnpm-lock.yaml) dedupes the plugin's copy to 3.5.4 and ESLint
crashes before linting.

Workaround: pin `zod-validation-error` to `4.0.2` (pnpm overrides / pnpm-workspace.yaml).
