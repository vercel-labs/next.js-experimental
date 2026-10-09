import { Suspense } from 'react'
import { connection } from 'next/server'
import ClientShell from '../../components/shell-slow-with-loading'

async function Dyn() {
  await connection()
  return <p>dynamic server part</p>
}

export default function Page() {
  return (
    <main>
      <h1>case: stream-with-loading</h1>
      <ClientShell />
      <Suspense fallback={<p>loading dyn…</p>}><Dyn /></Suspense>
    </main>
  )
}
