import Link from 'next/link'
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/about" id="about-link">About</Link>{' '}
          <Link href="/contact" id="contact-link">Contact</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
