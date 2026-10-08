import type { Metadata } from 'next'
import { ReactNode } from 'react'

// The root metadata resolves slowly, so it is still streaming in when the
// client calls `router.refresh()` right after hydration.
export async function generateMetadata(): Promise<Metadata> {
  await new Promise((resolve) => setTimeout(resolve, 4000))
  return {
    title: 'Root Title',
    description: 'metadata duplication regression test',
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
