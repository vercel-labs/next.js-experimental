import { prefetch as prefetchStage } from 'next/cache'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <main>
      <div id="shell-content-full">Shell content for full</div>
      <Suspense fallback={<div>Loading prefetch stage...</div>}>
        <PrefetchStageContent />
      </Suspense>
    </main>
  )
}

async function PrefetchStageContent() {
  // Everything below `await prefetch()` is excluded from the App Shell, so
  // this request data is only read once the per-link (runtime) prefetch stage
  // is requested.
  await prefetchStage()
  const cookieStore = await cookies()
  const value = cookieStore.get('testCookie')?.value ?? 'none'
  return (
    <div id="prefetch-stage-full">Prefetch-stage content for full: {value}</div>
  )
}
