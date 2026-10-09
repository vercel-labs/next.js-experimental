# next dev code frames keep the startup terminal width (vercel/next.js#99915)

Based on https://github.com/awss1i/next-dev-code-frame-resize, plus a scripted PTY
harness so the resize can be verified without manually dragging a terminal.

## Run

```bash
npm install
python3 resize-harness.py dev-output.log   # Linux/macOS, needs python3
# then inspect dev-output.log
```

The harness starts `npm run dev` on a PTY sized to 200 columns, requests
`/width`, resizes the PTY to 70 columns (TIOCSWINSZ + SIGWINCH), and requests
`/width` again.

Manual variant: `npm run dev` in a real 200-column terminal, open
http://localhost:3000/width, narrow the terminal to ~70 columns, open it again.

## Observed with next@16.4.0 (and 16.5.0-canary)

Both code frames are identical and 116 characters wide; the second one wraps in
the 70-column terminal.

## Expected (next@16.4.0-canary.61)

The second code frame is truncated to the current 70-column width (`... line bel...`).

Root cause hint: `next dev` pipes the server's stdout through the CLI, so
`process.stdout.columns` is undefined in the server process and
`shared/lib/errors/code-frame` falls back to `NEXT_PRIVATE_TERMINAL_COLUMNS`,
which is set once at spawn time and never updated on SIGWINCH.
