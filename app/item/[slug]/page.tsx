import { Suspense } from 'react'
import { notFound } from 'next/navigation'

const KNOWN = ['alpha', 'beta']

export async function generateStaticParams() {
  return KNOWN.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!KNOWN.includes(slug)) {
    notFound()
  }
  return { title: `Item ${slug}` }
}

async function Item({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!KNOWN.includes(slug)) {
    notFound()
  }
  return <h1>Item {slug}</h1>
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<p>loading…</p>}>
      <Item params={params} />
    </Suspense>
  )
}
