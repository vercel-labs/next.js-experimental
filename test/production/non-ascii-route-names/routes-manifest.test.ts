import { join } from 'path'
import fs from 'fs-extra'
import { FileRef, nextTestSetup } from 'e2e-utils'

/**
 * External routers (such as a deployment platform) route requests with the
 * regexes from the routes manifest, matching them against the raw, still
 * percent-encoded request pathname. A route whose name contains non-ASCII
 * characters is stored decoded, so its manifest regex has to match both forms.
 */
describe('non-ascii route names - routes manifest', () => {
  const { next, skipped } = nextTestSetup({
    files: new FileRef(join(__dirname, 'fixture')),
    skipDeployment: true,
    skipStart: true,
  })

  if (skipped) return

  let manifest: {
    dynamicRoutes: Array<{
      page: string
      regex: string
      namedRegex: string
    }>
    dataRoutes: Array<{ page: string; dataRouteRegex: string }>
  }

  beforeAll(async () => {
    await next.build()
    manifest = await fs.readJson(
      join(next.testDir, '.next/routes-manifest.json')
    )
  })

  it('matches the encoded and decoded form of an app route', () => {
    const route = manifest.dynamicRoutes.find(
      ({ page }) => page === '/блог/[slug]'
    )
    expect(route).toBeDefined()

    for (const source of [route!.regex, route!.namedRegex]) {
      const regex = new RegExp(source)
      expect(regex.test('/%D0%B1%D0%BB%D0%BE%D0%B3/hello')).toBe(true)
      // Percent-encoding hex digits are case-insensitive.
      expect(regex.test('/%d0%b1%d0%bb%d0%be%d0%b3/hello')).toBe(true)
      expect(regex.test('/блог/hello')).toBe(true)
      expect(regex.test('/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/hello')).toBe(
        false
      )
    }
  })

  it('captures the param from an encoded pathname', () => {
    const route = manifest.dynamicRoutes.find(
      ({ page }) => page === '/блог/[slug]'
    )

    expect(
      new RegExp(route!.namedRegex).exec(
        '/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82'
      )?.groups
    ).toEqual({ nxtPslug: '%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82' })
  })

  it('matches the encoded form of a pages data route', () => {
    const route = manifest.dataRoutes.find(
      ({ page }) => page === '/статья/[slug]'
    )
    expect(route).toBeDefined()

    const regex = new RegExp(route!.dataRouteRegex)
    expect(
      regex.test(
        `/_next/data/${next.buildId}/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/hello.json`
      )
    ).toBe(true)
    expect(regex.test(`/_next/data/${next.buildId}/статья/hello.json`)).toBe(
      true
    )
  })
})
