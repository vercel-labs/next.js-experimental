'use client'
export const HEAVY_MARKER = 'HEAVY_LAZY_UNIQUE_MARKER_a90d'
export default function Heavy() {
  return <div data-marker={HEAVY_MARKER}>{'x'.repeat(2000)}</div>
}
