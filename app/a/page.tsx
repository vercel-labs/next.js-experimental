'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Panel = dynamic(() => import('../markdown-panel'))
const Diagram = dynamic(() => import('../diagram'), { ssr: false })

export default function A() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button id="open-link" onClick={() => setOpen(true)}>open A</button>
      {open && (
        <>
          <Panel />
          <Diagram />
        </>
      )}
    </div>
  )
}
