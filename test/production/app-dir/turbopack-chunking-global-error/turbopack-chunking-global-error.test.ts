import { nextTestSetup } from 'e2e-utils'
import { listClientChunks } from 'next-test-utils'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Client chunks register their modules as `"<module id>", <factory>` while
// imports of a module from another chunk look like `e.i("<module id>")`. With
// `experimental.turbopackModuleIds: 'named'` the ids are the source paths, so
// this finds the chunks that actually *contain* a copy of a module.
const MODULE_DEFINITION = /"(\[project\][^"]+)",\s*(?:\(|[A-Za-z_$])/g

// Turbopack is the only bundler with this chunker, Webpack/Rspack split the
// shared modules differently and ignore `experimental.turbopackModuleIds`.
;(process.env.IS_TURBOPACK_TEST ? describe : describe.skip)(
  'turbopack chunking with a custom global-error',
  () => {
    const { next } = nextTestSetup({
      files: __dirname,
      skipStart: true,
    })

    // module id -> client chunks containing a copy of that module
    let chunksByModule: Map<string, string[]>

    beforeAll(async () => {
      const { exitCode } = await next.build()
      expect(exitCode).toBe(0)

      const distDir = join(next.testDir, '.next')
      const chunks = (await listClientChunks(distDir)).filter(
        (name) => name.includes('chunks') && name.endsWith('.js')
      )

      chunksByModule = new Map()
      for (const chunk of chunks) {
        const source = await readFile(join(distDir, chunk), 'utf8')
        for (const [, moduleId] of source.matchAll(MODULE_DEFINITION)) {
          const containing = chunksByModule.get(moduleId) ?? []
          if (!containing.includes(chunk)) {
            containing.push(chunk)
          }
          chunksByModule.set(moduleId, containing)
        }
      }
    })

    function countChunksContaining(moduleIdSuffix: string) {
      let count = 0
      for (const [moduleId, chunks] of chunksByModule) {
        if (moduleId.endsWith(moduleIdSuffix)) {
          count += chunks.length
        }
      }
      return count
    }

    // The root layout and `app/global-error.tsx` import the same client
    // components. They should end up in a single shared chunk, but Turbopack
    // currently copies them into both the page chunk and the global-error
    // chunk. Without `app/global-error.tsx` each of these modules is emitted
    // exactly once.
    it('copies modules shared with the root layout into a second chunk', () => {
      expect({
        theme: countChunksContaining(
          'components/theme.tsx [app-client] (ecmascript)'
        ),
        nav: countChunksContaining(
          'components/nav.tsx [app-client] (ecmascript)'
        ),
        link: countChunksContaining(
          'next/dist/client/app-dir/link.js [app-client] (ecmascript)'
        ),
      }).toEqual({
        // TODO(turbopack-chunking): all of these should be 1, i.e. emitted
        // into a single shared chunk.
        theme: 2,
        nav: 2,
        link: 2,
      })
    })
  }
)
