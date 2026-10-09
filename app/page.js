import { Suspense } from 'react'
import { cookies } from 'next/headers'

async function getStaticGreeting() {
  'use cache'
  return 'static shell (prerendered at build time)'
}

async function DynamicPart() {
  const store = await cookies()
  return <p id="dynamic">theme cookie: {store.get('theme')?.value ?? 'none'}</p>
}

export default async function Page() {
  const greeting = await getStaticGreeting()
  return (
    <main>
      <p id="static">{greeting}</p>
      <Suspense fallback={<p id="fallback">loading dynamic hole…</p>}>
        <DynamicPart />
      </Suspense>
    </main>
  )
}
