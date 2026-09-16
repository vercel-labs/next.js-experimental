'use client'
import { useState } from 'react'
export function C_widgetd() {
  const [n, setN] = useState(0)
  return <div id="widget-d" onClick={() => setN(n + 1)}>widget-d:{n}</div>
}
