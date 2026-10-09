'use client'

import { useState } from 'react'

export function Client() {
  const [status, setStatus] = useState('idle')

  async function startWorker() {
    const { createWorker } = await import('dynamic-worker-package')
    // No `workerUrl` option, so only the static fallback is used at runtime.
    const worker = createWorker()
    worker.onmessage = ({ data }) => {
      setStatus(data)
      worker.terminate()
    }
  }

  return (
    <main>
      <button onClick={startWorker}>Start worker</button>
      <p id="status">{status}</p>
    </main>
  )
}
