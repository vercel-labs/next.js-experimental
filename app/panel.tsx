'use client'

import { lazy, Suspense } from 'react'

const Markdown = lazy(() => import('./markdown'))

export default function Panel() {
  return (
    <div id="panel">
      <Suspense fallback={<p>panel loading…</p>}>
        <Markdown />
      </Suspense>
    </div>
  )
}
