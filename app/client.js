'use client'
import { useEffect, useState } from 'react'

export default function Client() {
  const [msg, setMsg] = useState('idle')
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { createWorker } = await import('fake-worker-lib')
      const w = createWorker()
      w.onmessage = (e) => !cancelled && setMsg(String(e.data))
      w.postMessage('hello')
    })()
    return () => {
      cancelled = true
    }
  }, [])
  return <p id="out">{msg}</p>
}
