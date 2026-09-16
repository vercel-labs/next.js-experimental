'use client'
import { useState } from 'react'
export function C_widgeta() {
  const [n, setN] = useState(0)
  return <div id="widget-a" onClick={() => setN(n + 1)}>widget-a:{n}</div>
}
