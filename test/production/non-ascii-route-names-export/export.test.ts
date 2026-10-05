import { join } from 'path'
import cheerio from 'cheerio'
import fs from 'fs-extra'
import type { AddressInfo } from 'net'
import type { Server } from 'http'
import { FileRef, nextTestSetup } from 'e2e-utils'
import { renderViaHTTP, startCleanStaticServer } from 'next-test-utils'

describe('non-ascii route names - static export', () => {
  const { next, skipped } = nextTestSetup({
    files: new FileRef(join(__dirname, 'fixture')),
    skipDeployment: true,
    skipStart: true,
  })

  if (skipped) return

  let server: Server | undefined
  let port: number

  beforeAll(async () => {
    await next.build()

    server = await startCleanStaticServer(join(next.testDir, 'out'))
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server!.close(resolve))
    }
  })

  it('exports non-ASCII routes under their decoded filenames', async () => {
    const out = join(next.testDir, 'out')

    expect(await fs.pathExists(join(out, 'тест.html'))).toBe(true)
    expect(await fs.pathExists(join(out, 'блог/привет.html'))).toBe(true)
  })

  it('serves the exported non-ASCII routes over encoded paths', async () => {
    // A static host resolves the request path against the exported files, so
    // the encoded path has to reach the decoded filename.
    expect(
      cheerio
        .load(await renderViaHTTP(port, '/%D1%82%D0%B5%D1%81%D1%82.html'))(
          '#static'
        )
        .text()
    ).toBe('static тест')

    // The param value is prerendered still percent-encoded, which is
    // pre-existing behavior for every dynamic app route. What matters here is
    // that the route was exported and is reachable.
    expect(
      cheerio
        .load(
          await renderViaHTTP(
            port,
            '/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82.html'
          )
        )('#dynamic')
        .text()
    ).toStartWith('блог: ')
  })
})
