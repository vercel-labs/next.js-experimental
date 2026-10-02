import { Suspense } from 'react'
import { getData } from '../../data'

export const unstable_paramMatching = {
  slug: 'blocking',
} as const

export function generateStaticParams() {
  return [{ slug: 'seed' }]
}

function ShellMarker() {
  return <p data-shell-marker="blocking">{performance.now().toFixed(3)}</p>
}

async function Data({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  return (
    <p id="data" data-slug={slug}>
      {data}
    </p>
  )
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <>
      <ShellMarker />
      <Suspense fallback={<p id="fallback">waiting for params</p>}>
        <Data params={params} />
      </Suspense>
    </>
  )
}
