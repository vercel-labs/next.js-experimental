import { nextTestSetup } from 'e2e-utils'

// Regression test for the client-rendering bailout error that is reported
// without any attribution: with Cache Components, partial prefetching, and
// `instant = false`, a client component that renders unstable values in the
// route shell (outside of Suspense) fails the build with "client rendering was
// requested outside a Suspense boundary", but neither the default build nor
// `--debug-prerender` names the component, hook, or file that caused the
// bailout (unlike the sync IO prerender errors, which do).
//
// The assertions below pin the *current* (incomplete) output. Once the
// bailout is attributed, these expectations must be updated to assert the
// component name instead.
//
// @force-gate prod
// @force-gate !deploy
describe('client-render-bailout-attribution', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    skipStart: true,
  })

  describe.each([
    { isDebugPrerender: false, name: 'next build' },
    { isDebugPrerender: true, name: 'next build --debug-prerender' },
  ])('$name', ({ isDebugPrerender }) => {
    let output: string

    beforeAll(async () => {
      const result = await next.build({
        args: isDebugPrerender ? ['--debug-prerender'] : [],
      })

      expect(result.exitCode).not.toBe(0)
      output = result.cliOutput
    })

    it('fails prerendering with the unattributed client rendering bailout error', () => {
      expect(output).toContain('Error occurred prerendering page "/random"')
      expect(output).toContain(
        'The server render could not complete because client rendering was requested outside a Suspense boundary'
      )
      expect(output).toContain("reason: 'Render in Browser'")
    })

    it('does not name the client component, hook, or file that bailed out', () => {
      // The whole stack of the bailout error is collapsed, so there is no
      // owner stack or source location for the offending component.
      expect(output).toContain('at ignore-listed frames')
      expect(output).not.toContain('RandomClient')
      expect(output).not.toContain('random-client.tsx')
    })
  })
})
