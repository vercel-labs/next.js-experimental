'use client'

import dynamic from 'next/dynamic'

const WebglCanvas = dynamic(() => import('./webgl-canvas'), { ssr: false })

export default function CanvasHost() {
  return (
    <div data-testid="canvas-host">
      <WebglCanvas />
    </div>
  )
}
