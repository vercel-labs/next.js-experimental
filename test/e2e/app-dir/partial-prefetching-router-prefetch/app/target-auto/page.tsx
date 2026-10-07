import { prefetch as prefetchStage } from 'next/cache'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <main>
      <div id="shell-content-auto">Shell content for auto</div>
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
    <div id="prefetch-stage-auto">Prefetch-stage content for auto: {value}</div>
  )
}
