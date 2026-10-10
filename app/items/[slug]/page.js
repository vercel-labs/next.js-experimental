export const revalidate = 60

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  return { title: `Item ${slug}` }
}

export default async function ItemPage({ params }) {
  const { slug } = await params
  return (
    <main>
      <h1>ISR item: {slug}</h1>
      <p>This deliberately sizeable marker makes duplicate full payloads easy to identify.</p>
      <pre>{'FULL_RSC_PAYLOAD_MARKER_'.repeat(80)}</pre>
    </main>
  )
}
