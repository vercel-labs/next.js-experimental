'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Panel = dynamic(() => import('./panel'), { ssr: false })
const Markdown = lazy(() => import('./markdown'))

export function Chat() {
  const [open, setOpen] = useState(false)
  const [api, setApi] = useState<unknown>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/data')
      .then(async (r) => ({ status: r.status, body: (await r.text()).slice(0, 200) }))
      .then(setApi)
      .catch((e) => setApi({ error: String(e) }))
  }, [open])

  return (
    <div>
      <button id="open" onClick={() => setOpen(true)}>
        open deferred UI
      </button>
      {open ? (
        <Suspense fallback={<p>loading…</p>}>
          <Panel />
          <Markdown source={'## chat\n\n```js\nvar z = 1\n```'} />
          <pre id="api">{JSON.stringify(api)}</pre>
        </Suspense>
      ) : null}
    </div>
  )
}
