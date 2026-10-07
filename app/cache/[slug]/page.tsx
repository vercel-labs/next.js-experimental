import { Suspense } from 'react'
import CanvasClient from '../../../components/canvas-client'

async function getData(slug: string) {
  'use cache'
  return `cached-${slug}`
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  return (
    <main id="route-content">
      <h1 id="heading">Route content: {data}</h1>
      <CanvasClient />
    </main>
  )
}

export default function Page(props: any) {
  return (
    <Suspense fallback={<div id="full-page-fallback" style={{ position: 'fixed', inset: 0, background: 'black', color: 'white' }}>Loading…</div>}>
      <Content {...props} />
    </Suspense>
  )
}
