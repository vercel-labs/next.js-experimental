import { execFileSync } from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'

// `@next/codemod cache-components-instant-false <dir>` walks a directory on
// disk and decides per file path whether a file is an App Router route
// segment. The fixture is created in a temp directory instead of being checked
// in, because the files that trigger the bug are named `page.test.tsx` /
// `layout.test.tsx` and jest would collect them as test suites of this repo.
const repoRoot = path.join(__dirname, '..', '..', '..')
const codemodDir = path.join(repoRoot, 'packages', 'next-codemod')
// The CLI shells out to jscodeshift with these flags, so the test drives the
// same binary and transform instead of calling the transform in-process.
const jscodeshiftBin = require.resolve('jscodeshift/bin/jscodeshift.js', {
  paths: [codemodDir],
})
const transformPath = path.join(
  codemodDir,
  'transforms',
  'cache-components-instant-false.ts'
)

const segment = `export default function Segment({
  children,
}: {
  children?: React.ReactNode
}) {
  return <main>{children}</main>
}
`

const colocatedTest = `import Segment from './page'

test('renders', () => {
  expect(Segment).toBeDefined()
})
`

const files = {
  'app/layout.tsx': segment,
  'app/page.tsx': segment,
  'app/dashboard/page.tsx': segment,
  'app/layout.test.tsx': colocatedTest,
  'app/page.test.tsx': colocatedTest,
  'app/components/page-header.tsx': segment,
}

describe('cache-components-instant-false codemod file selection', () => {
  let cwd: string

  beforeAll(async () => {
    cwd = await fs.mkdtemp(
      path.join(os.tmpdir(), 'cache-components-instant-false-')
    )

    for (const [file, source] of Object.entries(files)) {
      await fs.outputFile(path.join(cwd, file), source)
    }

    execFileSync(
      process.execPath,
      [
        jscodeshiftBin,
        '--parser=tsx',
        '--extensions=tsx,ts,jsx,js,mjs',
        '--ignore-pattern=**/node_modules/**',
        '--transform',
        transformPath,
        'app',
      ],
      {
        cwd,
        stdio: 'pipe',
        // The transform only applies its route-segment path filter outside of
        // `NODE_ENV=test`, which jest sets for this process.
        env: { ...process.env, NODE_ENV: 'production' },
      }
    )
  })

  afterAll(async () => {
    if (cwd) {
      await fs.remove(cwd)
    }
  })

  it('inserts `export const instant = false` into colocated test files', async () => {
    const touched: Record<string, boolean> = {}

    for (const file of Object.keys(files)) {
      touched[file] = (
        await fs.readFile(path.join(cwd, file), 'utf8')
      ).includes('export const instant = false')
    }

    expect(touched).toEqual({
      // Real route segments, correctly opted out of instant rendering.
      'app/layout.tsx': true,
      'app/page.tsx': true,
      'app/dashboard/page.tsx': true,
      // Current behavior: the path filter accepts any suffix after `page.` or
      // `layout.`, so colocated unit tests are rewritten as if they were route
      // segments. Both should become `false` once the filter honors the
      // configured page extensions.
      'app/layout.test.tsx': true,
      'app/page.test.tsx': true,
      // A module that merely contains `page` in its name is left alone.
      'app/components/page-header.tsx': false,
    })
  })
})
