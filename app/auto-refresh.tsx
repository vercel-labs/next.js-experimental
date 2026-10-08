'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function countHeadTags() {
  return {
    icons: document.head.querySelectorAll('link[rel~="icon"]').length,
    titles: document.head.querySelectorAll('title').length,
  }
}

export function AutoRefresh() {
  const router = useRouter()
  const fired = useRef(false)
  const [counts, setCounts] = useState('')

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const before = countHeadTags()
    router.refresh()
    const timer = setInterval(() => {
      setCounts(JSON.stringify({ before, now: countHeadTags() }))
    }, 500)
    return () => clearInterval(timer)
  }, [router])

  return <pre id="counts">{counts}</pre>
}
