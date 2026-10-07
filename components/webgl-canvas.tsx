'use client'

import { useEffect, useRef } from 'react'

export default function WebGLCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const gl = ref.current?.getContext('webgl')
    if (gl) {
      gl.clearColor(0.1, 0.4, 0.8, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
  }, [])
  return <canvas id="webgl" ref={ref} width={200} height={100} />
}
