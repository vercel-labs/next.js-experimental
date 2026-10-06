'use client'

import { usePathname } from 'next/navigation'

export function RouteAnalyticsReporter() {
  const pathname = usePathname()
  void pathname
  return null
}
