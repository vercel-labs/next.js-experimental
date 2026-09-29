import { ImageResponse } from 'next/og'

// Documented App Router metadata file exports:
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
export const alt = 'About Acme'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(<div style={{ fontSize: 128 }}>About Acme</div>, {
    ...size,
  })
}
