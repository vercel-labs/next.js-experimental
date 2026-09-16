'use client'
import { useState } from 'react'
export function C_header() {
  const [n, setN] = useState(0)
  return <div id="header" onClick={() => setN(n + 1)}>header:{n}</div>
}
