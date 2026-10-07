'use client'

// Module-scope window touch: makes this module client-only.
const DPR = window.devicePixelRatio || 1

export default function WebglCanvas() {
  return (
    <canvas
      data-testid="webgl-canvas"
      width={200 * DPR}
      height={100 * DPR}
      style={{ width: 200, height: 100, background: '#123' }}
    />
  )
}
