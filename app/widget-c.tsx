'use client'
import { useState } from 'react'
export function C_widgetc() {
  const [n, setN] = useState(0)
  return <div id="widget-c" onClick={() => setN(n + 1)}>widget-c:{n}</div>
}
