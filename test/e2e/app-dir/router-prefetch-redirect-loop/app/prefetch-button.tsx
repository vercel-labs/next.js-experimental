'use client'

import { useRouter } from 'next/navigation'

type PrefetchOptions = NonNullable<
  Parameters<ReturnType<typeof useRouter>['prefetch']>[1]
>

// `PrefetchKind` is a TypeScript enum in Next, so the literal needs a cast.
const FULL = { kind: 'full' } as PrefetchOptions

export function PrefetchButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      data-testid="prefetch-full"
      onClick={() => router.prefetch('/docs/changelog', FULL)}
    >
      prefetch
    </button>
  )
}
