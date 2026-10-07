import path from 'path'
import { execFile } from 'child_process'
import stripAnsi from 'strip-ansi'
import { nextTestSetup } from 'e2e-utils'

describe('next-config-ts-relative-import-outside-cwd', () => {
  const { next, skipped } = nextTestSetup({
    files: __dirname,
    // The regression below runs the app's own CLI locally, which a deployment
    // cannot expose.
    skipDeployment: true,
  })

  if (skipped) {
    return
  }

  // Runs the Next.js CLI installed in the test app, from `cwd`.
  function runCLI(args: string[], cwd: string) {
    return new Promise<{ exitCode: number; output: string }>((resolve) => {
      const child = execFile(
        process.execPath,
        [
          require.resolve('next/dist/bin/next', { paths: [next.testDir] }),
          ...args,
        ],
        {
          cwd,
          env: {
            ...process.env,
            ...next.env,
            NEXT_TELEMETRY_DISABLED: '1',
          },
        },
        (_error, stdout, stderr) => {
          resolve({
            exitCode: child.exitCode ?? 1,
            output: stripAnsi(`${stdout}${stderr}`),
          })
        }
      )
    })
  }

  it('loads a config with a relative import when next runs in the app directory', async () => {
    const $ = await next.render$('/')
    expect($('p').text()).toBe('from-config-helpers')
  })

  it('fails to load the same config when next upgrade --agent receives the app directory from another cwd', async () => {
    const { exitCode, output } = await runCLI(
      ['upgrade', path.basename(next.testDir), '--agent=latest'],
      path.dirname(next.testDir)
    )

    // The transpiled config is required without a filename, so its relative
    // imports resolve against the cwd instead of the config's directory.
    // This asserts the current (incorrect) behavior; fixing the loader must
    // update this expectation.
    expect(output).toContain(
      `Could not prepare the upgrade: Cannot find module './config-helpers'`
    )
    expect(exitCode).toBe(1)
  })
})
