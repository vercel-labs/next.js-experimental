import { Suspense } from 'react'
import { notFound } from 'next/navigation'

const KNOWN_ITEMS = ['alpha', 'beta']

export function generateStaticParams() {
  return KNOWN_ITEMS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!KNOWN_ITEMS.includes(slug)) {
    notFound()
  }
  return { title: `Item ${slug}` }
}

async function Item({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!KNOWN_ITEMS.includes(slug)) {
    notFound()
  }
  return <p id="item">{slug}</p>
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<p id="pending">loading</p>}>
      <Item params={params} />
    </Suspense>
  )
}
