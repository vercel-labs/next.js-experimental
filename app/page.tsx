import { Suspense } from 'react'

async function Slow() {
  'use cache'
  const now = Date.now()
  return <p data-testid="home">home {now}</p>
}

export default function Page() {
  return (
    <main>
      <h1>Repro</h1>
      <Suspense fallback={<p>loading</p>}>
        <Slow />
      </Suspense>
    </main>
  )
}
