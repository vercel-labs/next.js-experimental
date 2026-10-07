'use client'

import { useEffect, useState } from 'react'

export default function Diagram() {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let cancelled = false
    import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false })
      const id = 'd' + Math.random().toString(36).slice(2)
      const { svg } = await mermaid.render(id, 'graph TD; A-->B;')
      if (!cancelled) setSvg(svg)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return <div className="diagram" dangerouslySetInnerHTML={{ __html: svg }} />
}
