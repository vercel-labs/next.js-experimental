'use client'

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { log, remote, lifecycleLog, subscribe, getSnapshot } from '../log'

export default function KeptPage() {
  const [message, setMessage] = useState('(no message)')

  // Expose the setter so /other can set state while this page is kept hidden
  // by <Activity mode="hidden">.
  remote.setMessage = setMessage

  // Pattern from https://nextjs.org/docs/app/guides/preserving-ui-state :
  // "reset transient state in a useLayoutEffect cleanup" - documented as
  // running when Activity hides the component.
  useLayoutEffect(() => {
    log('kept: useLayoutEffect SETUP')
    return () => {
      log('kept: useLayoutEffect CLEANUP -> setMessage("(no message)")')
      setMessage('(no message)')
    }
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, () => 0)

  return (
    <main>
      <h1>kept page</h1>
      <p>
        message: <b id="message">{message}</b>
      </p>
      <pre id="log" style={{ background: '#eee', padding: 12 }}>
        {lifecycleLog.join('\n')}
      </pre>
    </main>
  )
}
