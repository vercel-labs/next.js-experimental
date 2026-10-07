'use client'
import { useState } from 'react'
import { ping } from './actions'
export default function Page() {
  const [msg, setMsg] = useState('idle')
  return (
    <main>
      <h1>Server Action version-skew repro</h1>
      <button id="run" onClick={async () => {
        try {
          const r = await ping()
          setMsg('resolved: ' + JSON.stringify(r))
        } catch (e: any) {
          setMsg('rejected: ' + e?.name + ': ' + e?.message + '\n' + (e?.stack || ''))
        }
      }}>run action</button>
      <pre id="out">{msg}</pre>
    </main>
  )
}
