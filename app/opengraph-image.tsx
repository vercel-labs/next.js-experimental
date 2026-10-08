import { ImageResponse } from 'next/og'

// Documented metadata config exports
export const alt = 'About Acme'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex' }}>About Acme</div>,
    { ...size }
  )
}
