'use client'

import { useRouter } from 'next/navigation'

export function ManualPrefetchLink({
  href,
  id,
  kind,
  children,
}: {
  href: string
  id: string
  kind?: 'auto' | 'full'
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <a
      id={id}
      href={href}
      onPointerEnter={() => {
        ;(router.prefetch as any)(href, kind ? { kind } : undefined)
      }}
    >
      {children} (router.prefetch kind={kind ?? 'default'})
    </a>
  )
}
