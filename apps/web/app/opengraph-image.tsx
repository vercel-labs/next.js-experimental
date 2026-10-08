// Copy of the Next.js docs example: "Using local assets" in opengraph-image.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), 'logo.png'))
  const logoSrc = Uint8Array.from(logoData).buffer

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <img src={logoSrc as unknown as string} height="100" alt="logo" />
      </div>
    )
  )
}
