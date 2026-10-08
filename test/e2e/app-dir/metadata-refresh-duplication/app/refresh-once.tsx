'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshOnce() {
  const router = useRouter()
  const [refreshed, setRefreshed] = useState(false)

  useEffect(() => {
    if (!window.location.search.includes('refresh=1')) return
    router.refresh()
    setRefreshed(true)
  }, [router])

  return <p id="refreshed">{refreshed ? 'refreshed' : 'not refreshed'}</p>
}
