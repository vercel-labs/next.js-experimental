import { Suspense } from 'react'
import { connection } from 'next/server'


async function DynamicHole() {
  await connection()
  console.log('[repro] DYNAMIC HOLE EXECUTED ON SERVER at', Date.now())
  return <div id="dynamic-content">dynamic: {Date.now()}</div>
}

function StaticShell() {
  console.log('[repro] STATIC SHELL COMPONENT EXECUTED')
  return <h1 id="static-title">Pre-rendered Static Shell</h1>
}

export default function Page() {
  return (
    <main>
      <StaticShell />
      <Suspense fallback={<div id="fallback">Loading...</div>}>
        <DynamicHole />
      </Suspense>
    </main>
  )
}
