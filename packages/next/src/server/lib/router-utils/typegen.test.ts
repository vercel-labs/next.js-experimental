import { createRouteTypesManifest } from './route-types-utils'
import { generateValidatorFile, generateValidatorFileStrict } from './typegen'

describe('generateValidatorFile', () => {
  // App Router metadata file conventions (opengraph-image, sitemap, robots, ...)
  // are served as app routes, so route collection can classify them as route
  // handlers. They must not be validated against `RouteHandlerConfig`, because
  // their documented exports (`default`, `alt`, `size`, `contentType`, ...) have
  // no properties in common with it, which makes `tsc` fail with TS2559.
  it.failing(
    'does not validate app metadata files as route handlers',
    async () => {
      const manifest = await createRouteTypesManifest({
        dir: '/project',
        pageRoutes: [],
        appRoutes: [{ route: '/', filePath: '/project/app/page.tsx' }],
        appRouteHandlers: [
          { route: '/api/hello', filePath: '/project/app/api/hello/route.ts' },
          {
            route: '/opengraph-image',
            filePath: '/project/app/opengraph-image.tsx',
          },
          { route: '/robots.txt', filePath: '/project/app/robots.ts' },
          { route: '/sitemap.xml', filePath: '/project/app/sitemap.ts' },
        ],
        pageApiRoutes: [],
        layoutRoutes: [],
        slots: [],
      })

      for (const output of [
        generateValidatorFile(manifest),
        generateValidatorFileStrict(manifest),
      ]) {
        // The real route handler is still validated.
        expect(output).toContain('// Validate app/api/hello/route.ts')
        expect(output).toContain('RouteHandlerConfig<"/api/hello">')

        // Metadata files are not.
        expect(output).not.toContain('app/opengraph-image')
        expect(output).not.toContain('app/robots')
        expect(output).not.toContain('app/sitemap')
        expect(output).not.toContain('RouteHandlerConfig<"/opengraph-image">')
        expect(output).not.toContain('RouteHandlerConfig<"/robots.txt">')
        expect(output).not.toContain('RouteHandlerConfig<"/sitemap.xml">')
      }
    }
  )
})
