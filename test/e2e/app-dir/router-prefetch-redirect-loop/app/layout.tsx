import Link from 'next/link'
import { PrefetchButton } from './prefetch-button'

// Visible links under the dynamic route. Their automatic prefetches teach the
// router the `/[collection]/[...slug]` pattern for `/docs/*`, and each one is
// re-fetched on every round of the loop.
const SIDEBAR = ['alpha', 'beta', 'gamma', 'delta']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">/</Link>
          {SIDEBAR.map((slug) => (
            <Link key={slug} href={`/docs/${slug}`}>
              /docs/{slug}
            </Link>
          ))}
          <Link href="/changelog">/changelog</Link>
        </nav>
        <main>{children}</main>
        <PrefetchButton />
      </body>
    </html>
  )
}
