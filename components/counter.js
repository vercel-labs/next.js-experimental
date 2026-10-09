'use client'
import { useState } from 'react'
export default function Counter() {
  const [n, setN] = useState(0)
  return (
    <button id="counter" onClick={() => setN(n + 1)}>
      count: <span id="count">{n}</span>
    </button>
  )
}
