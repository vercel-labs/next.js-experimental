import { Suspense } from 'react'
import CanvasHost from '../../components/canvas-host'

export function generateStaticParams() {
  return [{ slug: 'a' }]
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await new Promise((r) => setTimeout(r, 1500))
  return (
    <main data-testid="route-content">
      <h1>route content for {slug}</h1>
      <CanvasHost />
    </main>
  )
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div
          data-testid="fallback"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'black',
            color: 'white',
          }}
        >
          Loading…
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  )
}
