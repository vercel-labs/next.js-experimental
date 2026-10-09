'use client'
import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export default function Diagram() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false })
    mermaid.render('d1', 'graph TD; A-->B;').then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    })
  }, [])
  return <div id="diagram" ref={ref} />
}
