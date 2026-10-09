'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Diagram = dynamic(() => import('../diagram'), { ssr: false })
const CodeBlock = dynamic(() => import('../code-block'), { ssr: false })

export default function B() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button id="open-link" onClick={() => setOpen(true)}>open B</button>
      {open && (
        <>
          <CodeBlock />
          <Diagram />
        </>
      )}
    </div>
  )
}
