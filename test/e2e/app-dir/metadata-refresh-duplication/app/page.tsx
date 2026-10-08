import { connection } from 'next/server'
import { Suspense } from 'react'
import { RefreshOnce } from './refresh-once'

async function DynamicContent() {
  await connection()
  return <p id="dynamic-content">dynamic content</p>
}

export default function Page() {
  return (
    <main>
      <RefreshOnce />
      <Suspense fallback={<p id="dynamic-fallback">loading…</p>}>
        <DynamicContent />
      </Suspense>
    </main>
  )
}
