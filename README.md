# Verification harness for vercel/next.js#98752

Claim under test: "Duplicate chunk paths are repeatedly serialized for every
client reference" in the Flight payload, inflating wire size.

App Router page with 8 client components that share the same chunks.

## Run

```bash
npm install
npx next build            # Turbopack (default)
npx next start -p 3000 &
node inspect-flight.mjs http://localhost:3000/
node inspect-flight.mjs http://localhost:3000/dynamic
```

Repeat with a webpack build: `npx next build --webpack`.

## Result (next@16.4.0-canary.32, node 24)

Turbopack, `/`:

```
2:"/_next/static/chunks/0jof-hfyrek0k.js"
6:"/_next/static/chunks/3y461aw_qzuns.js"
7:I[48317,["$2","$6"],"C_header"]
8:I[30400,["$2","$6"],"C_sidebar"]
...
e:I[16789,["$2","$6"],"C_widgetd"]
```

Webpack, dynamic (`next start`, per-request render) `/dynamic`:

```
12:"static/chunks/app/dynamic/page-f8174c86f930462d.js"
13:I[1981,["804","$12"],"C_header"]
14:I[2294,["804","$12"],"C_sidebar"]
...
```

Each shared chunk path string is emitted exactly once and every later client
reference points at it with a Flight back-reference (`$2`, `$6`, `$12`).
Only the short numeric webpack chunk *id* ("804", 3-5 bytes) repeats. No
duplicate chunk paths are serialized, so the premise of the issue does not
reproduce on current canary.
