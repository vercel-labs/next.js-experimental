import { Suspense } from 'react'
import CanvasClient from '../../../components/canvas-client'

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <main id="route-content">
      <h1 id="heading">Route content: {slug}</h1>
      <CanvasClient />
    </main>
  )
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div
          id="full-page-fallback"
          style={{ position: 'fixed', inset: 0, background: 'black', color: 'white' }}
        >
          Loading…
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  )
}
