import { Suspense } from 'react'
import { connection } from 'next/server'
import { AutoRefresh } from './auto-refresh'

async function Dynamic() {
  await connection()
  return <p id="dyn">dynamic {Date.now()}</p>
}

export default function Page() {
  return (
    <main>
      <h1>router.refresh() duplicates root metadata</h1>
      <Suspense fallback={<p id="dyn">loading…</p>}>
        <Dynamic />
      </Suspense>
      <AutoRefresh />
    </main>
  )
}
