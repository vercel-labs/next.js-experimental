import type { Metadata } from 'next'
import { connection } from 'next/server'

// Dynamic (uncached) root metadata => Next streams the metadata into <head>
// from the client instead of emitting it in the initial flight payload only.
// A static `export const metadata` shows the same bug intermittently, the
// artificial delay below just makes the race deterministic.
export async function generateMetadata(): Promise<Metadata> {
  await connection()
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    title: 'Repro Root Title',
    description: 'metadata duplication repro',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
