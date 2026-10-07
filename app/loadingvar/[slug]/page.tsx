import CanvasClient from '../../../components/canvas-client'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <main id="route-content">
      <h1 id="heading">Route content: {slug}</h1>
      <CanvasClient />
    </main>
  )
}
