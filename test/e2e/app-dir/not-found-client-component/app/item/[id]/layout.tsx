import { Suspense } from 'react'

export default function ItemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<p id="suspense-fallback">Loading item…</p>}>
      {children}
    </Suspense>
  )
}
