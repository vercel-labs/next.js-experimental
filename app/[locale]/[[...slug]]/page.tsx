import { notFound } from 'next/navigation'
import { NODES } from '../../../content'

export async function generateStaticParams() {
  return [
    { locale: 'en', slug: undefined },
    ...NODES.map((node) => ({ locale: 'en', slug: [node] })),
  ]
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  // Every URL is covered by generateStaticParams, so this read is fully
  // prerendered -- but the insight still fires.
  const { locale, slug } = await params
  const path = slug?.join('/') ?? ''

  if (path !== '' && !NODES.includes(path)) {
    notFound()
  }

  return (
    <main>
      <h1>
        {locale} / {path || 'home'}
      </h1>
    </main>
  )
}
