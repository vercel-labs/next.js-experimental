'use client'
import Link from 'next/link'
import { useEffect } from 'react'

// When the app logs an error, the dev indicator expands into a wide pill
// ("1 issue"), so it covers app UI far outside the 32x32 Next.js logo.
export default function IssuePage() {
  useEffect(() => {
    console.error('app console error -> dev indicator shows an issue badge')
  }, [])
  return (
    <main>
      <p style={{ padding: 16 }}>Issue page</p>
      <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', gap: 8, padding: 8, background: '#eee' }}>
        <span style={{ width: 64 }} />
        <Link href="/menu">
          <button id="tab-button" style={{ padding: '10px 16px' }}>Menu tab</button>
        </Link>
      </nav>
    </main>
  )
}
