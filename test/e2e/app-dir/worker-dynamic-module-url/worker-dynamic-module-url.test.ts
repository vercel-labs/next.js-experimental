import { isNextDev, nextTestSetup } from 'e2e-utils'

// This is a production build concern: `next dev` compiles lazily, so the
// dependency is only processed once the client component requests it.
;(isNextDev ? describe.skip : describe)(
  'app dir - worker with a non-static new URL() in a dependency',
  () => {
    const { next, isTurbopack } = nextTestSetup({
      files: __dirname,
      dependencies: {
        // Mirrors a published package that creates a worker from a variable
        // URL in a branch that is only taken at runtime.
        'dynamic-worker-package': 'file:./dynamic-worker-package',
      },
      skipStart: true,
      skipDeployment: true,
    })

    it('should fail the Turbopack build on `new Worker(new URL(variable, import.meta.url))`', async () => {
      if (isTurbopack) {
        // TODO: Turbopack hard-errors on a non-static `new URL()` argument even
        // though the branch is never taken by the app. It should be left to
        // runtime (a warning at most), like webpack does, so the build should
        // succeed instead of failing here.
        await expect(next.start()).rejects.toThrow()
        expect(next.cliOutput).toInclude(
          "Module not found: Can't resolve (<dynamic> | 'undefined')"
        )
      } else {
        // webpack keeps the non-static `new URL()` as a runtime concern.
        await next.start()
        expect(next.cliOutput).not.toInclude('Module not found')
      }
    }, 240_000)
  }
)
