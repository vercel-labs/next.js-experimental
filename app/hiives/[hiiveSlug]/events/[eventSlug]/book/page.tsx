import { Suspense } from 'react'

async function Details({
  params,
}: {
  params: Promise<{ hiiveSlug: string; eventSlug: string }>
}) {
  const { hiiveSlug, eventSlug } = await params
  return (
    <p>
      book {hiiveSlug} / {eventSlug}
    </p>
  )
}

export default function BookPage({
  params,
}: {
  params: Promise<{ hiiveSlug: string; eventSlug: string }>
}) {
  return (
    <Suspense fallback={<p>loading…</p>}>
      <Details params={params} />
    </Suspense>
  )
}
