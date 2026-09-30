import { ImageResponse } from 'next/og'
export const alt = 'Post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params
  return new ImageResponse(<div>{slug}</div>, { ...size })
}
