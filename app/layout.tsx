import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: 24 }}>
        <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Link href="/kept" id="to-kept">
            /kept
          </Link>
          <Link href="/other" id="to-other">
            /other
          </Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
