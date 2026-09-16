'use client'
import { useState } from 'react'
export function C_sidebar() {
  const [n, setN] = useState(0)
  return <div id="sidebar" onClick={() => setN(n + 1)}>sidebar:{n}</div>
}
