'use client'

import { useRouter } from 'next/navigation'

type Router = ReturnType<typeof useRouter>
type PrefetchOptions = Parameters<Router['prefetch']>[1]

export default function Page() {
  const router = useRouter()
  return (
    <main>
      <h1>Home</h1>
      {/* The call shape documented by the `useRouter` API reference. */}
      <button
        id="prefetch-auto"
        onClick={() => router.prefetch('/target-auto')}
      >
        prefetch auto
      </button>
      {/* The undocumented escape hatch that does request the per-link stage. */}
      <button
        id="prefetch-full"
        onClick={() =>
          router.prefetch('/target-full', {
            kind: 'full' as NonNullable<PrefetchOptions>['kind'],
          })
        }
      >
        prefetch full
      </button>
    </main>
  )
}
