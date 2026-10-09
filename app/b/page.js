'use client'
import { useState } from 'react'

export default function B() {
  const [C, setC] = useState(null)
  return (
    <main>
      <button id="load" onClick={async () => { const m = await import('../heavy'); setC(() => m.default) }}>load</button>
      {C ? <C /> : null}
    </main>
  )
}
