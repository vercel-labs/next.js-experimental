'use client'
import { useState } from 'react'
export function C_widgetb() {
  const [n, setN] = useState(0)
  return <div id="widget-b" onClick={() => setN(n + 1)}>widget-b:{n}</div>
}
