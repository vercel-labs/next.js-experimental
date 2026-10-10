'use client'

import { ViewTransition, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [scheduled, setScheduled] = useState(false)

  function scheduleNavigation() {
    setScheduled(true)
    setTimeout(() => router.push('/destination'), 1500)
  }

  return (
    <ViewTransition name="repro-card">
      <main data-page="home">
        <h1>Hidden-tab ViewTransition reproduction</h1>
        <button onClick={scheduleNavigation}>Navigate after 1.5 seconds</button>
        <p>{scheduled ? 'Navigation scheduled; hide this tab now.' : 'Schedule the navigation, then switch tabs.'}</p>
      </main>
    </ViewTransition>
  )
}
