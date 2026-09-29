import { join } from 'path'
import cheerio from 'cheerio'
import fs from 'fs-extra'
import { FileRef, nextTestSetup } from 'e2e-utils'
import {
  fetchViaHTTP,
  findPort,
  initNextServerScript,
  killApp,
} from 'next-test-utils'

const encoded = {
  appStatic: '/%D1%82%D0%B5%D1%81%D1%82',
  appDynamic: '/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
  pagesStatic: '/%D0%BF%D0%B5%D0%B9%D0%B4%D0%B6',
  pagesDynamic:
    '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
}

describe('non-ascii route names - standalone output', () => {
  const { next, skipped } = nextTestSetup({
    files: new FileRef(join(__dirname, 'fixture')),
    skipDeployment: true,
    skipStart: true,
  })

  if (skipped) return

  let server: Awaited<ReturnType<typeof initNextServerScript>>
  let port: number

  beforeAll(async () => {
    await next.build()

    // The standalone server runs from its own directory, and only needs the
    // static assets copied in, exactly like the deployment docs describe.
    const standaloneDir = join(next.testDir, '.next/standalone')
    await fs.copy(
      join(next.testDir, '.next/static'),
      join(standaloneDir, '.next/static')
    )

    port = await findPort()
    server = await initNextServerScript(
      join(standaloneDir, 'server.js'),
      /- Local:/,
      { ...process.env, PORT: port.toString() },
      undefined,
      { cwd: standaloneDir }
    )
  })

  afterAll(async () => {
    if (server) await killApp(server)
  })

  it('serves a static app route with a non-ASCII name', async () => {
    const res = await fetchViaHTTP(port, encoded.appStatic)
    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#static')
        .text()
    ).toBe('static тест')
  })

  it('serves a dynamic app route under a non-ASCII segment', async () => {
    const res = await fetchViaHTTP(port, encoded.appDynamic)
    expect(res.status).toBe(200)
    // The param value reaches an app router page still percent-encoded, which
    // is pre-existing behavior for every dynamic app route. What matters here
    // is that the route resolves instead of rendering the 404 page.
    expect(
      cheerio
        .load(await res.text())('#dynamic')
        .text()
    ).toStartWith('блог: ')
  })

  it('serves a static pages route with a non-ASCII name', async () => {
    const res = await fetchViaHTTP(port, encoded.pagesStatic)
    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#pages-static')
        .text()
    ).toBe('static пейдж')
  })

  it('serves a dynamic pages route under a non-ASCII segment', async () => {
    const res = await fetchViaHTTP(port, encoded.pagesDynamic)
    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#pages-dynamic')
        .text()
    ).toBe('статья: привет')
  })
})
