import { Suspense } from 'react'
import { connection } from 'next/server'

async function Dynamic() {
  await connection()
  await new Promise((r) => setTimeout(r, 50))
  return <p data-testid="content">dynamic content</p>
}

export default function Dashboard() {
  return (
    <main>
      <h1 data-testid="dashboard">Dashboard</h1>
      <Suspense fallback={<p data-testid="loading">loading…</p>}>
        <Dynamic />
      </Suspense>
    </main>
  )
}
