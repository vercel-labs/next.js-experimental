'use client'
import { useState } from 'react'
import { shared } from '../shared'

export default function A() {
  const [C, setC] = useState(null)
  return (
    <main>
      <p id="static">{shared.length}</p>
      <button id="load" onClick={async () => { const m = await import('../heavy'); setC(() => m.default) }}>load</button>
      {C ? <C /> : null}
    </main>
  )
}
