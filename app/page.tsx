import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { Chat } from './chat'
import { Sidebar } from './sidebar'

async function Session() {
  const store = await cookies()
  return <span>{store.get('session')?.value ?? 'anonymous'}</span>
}

export default function Page() {
  return (
    <main>
      <h1>
        deferred markdown UI repro (
        <Suspense fallback={<span>…</span>}>
          <Session />
        </Suspense>
        )
      </h1>
      <Sidebar />
      <Chat />
    </main>
  )
}
