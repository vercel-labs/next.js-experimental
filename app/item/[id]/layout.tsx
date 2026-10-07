import { Suspense } from 'react'

export default function ItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <p id="item-layout">item layout (server)</p>
      <Suspense fallback={<p id="suspense-fallback">Suspense fallback…</p>}>
        {children}
      </Suspense>
    </section>
  )
}
