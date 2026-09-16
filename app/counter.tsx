'use client'
import { useState } from 'react'
export function C_counter() {
  const [n, setN] = useState(0)
  return <div id="counter" onClick={() => setN(n + 1)}>counter:{n}</div>
}
