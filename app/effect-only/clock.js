'use client'

import { useEffect, useState } from 'react'

export default function Clock() {
  const [now, setNow] = useState(null)

  useEffect(() => {
    // `new Date()` is only ever evaluated after mount, in the browser.
    setNow(new Date().toISOString())
  }, [])

  return <p id="clock">{now ?? 'loading'}</p>
}
