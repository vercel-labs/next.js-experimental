'use client'

import dynamic from 'next/dynamic'

const WebGLCanvas = dynamic(() => import('./webgl-canvas'), { ssr: false })

export default function CanvasClient() {
  return (
    <div id="canvas-wrapper">
      <WebGLCanvas />
    </div>
  )
}
