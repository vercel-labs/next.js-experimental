import { Suspense } from 'react'

async function getData() {
  'use cache'
  return 'cached value'
}

async function Content() {
  const data = await getData()
  return <main id="route-content"><h1 id="heading">{data}</h1></main>
}

export default function Page() {
  return (
    <Suspense fallback={<div id="full-page-fallback" style={{ position: 'fixed', inset: 0, background: 'black', color: 'white' }}>Loading…</div>}>
      <Content />
    </Suspense>
  )
}
