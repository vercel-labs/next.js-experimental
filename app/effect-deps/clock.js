'use client'

import { useEffect, useState } from 'react'

export default function Clock() {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(new Date().toISOString())
    // The `new Date()` below *looks* like it belongs to the effect, but the
    // dependency array is evaluated during render -> prerender error.
  }, [new Date().getDate()])

  return <p id="clock">{now ?? 'loading'}</p>
}
