import { Suspense } from 'react'
import CanvasClient from '../../../components/canvas-client'

export async function generateStaticParams() {
  return [{ slug: 'hello' }]
}

async function Content({ params, searchParams }: any) {
  const { slug } = await params
  await searchParams
  return (
    <main id="route-content">
      <h1 id="heading">Route content: {slug}</h1>
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
