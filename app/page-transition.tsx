'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'

/**
 * Mimics a "page transition" wrapper: it intercepts the Link click, plays an
 * animation, and then performs the navigation itself via router.push().
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter()

  function onClick(event: MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (!href) return
    event.preventDefault()
    // "animation" – a single frame is enough to leave the click handler
    requestAnimationFrame(() => {
      router.push(href)
    })
  }

  return <div onClick={onClick}>{children}</div>
}
