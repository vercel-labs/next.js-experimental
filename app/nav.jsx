'use client'
import Link from 'next/link'
export default function Nav() {
  return (
    <nav>
      <Link href="/" id="to-home">Home</Link>{' '}
      <Link href="/other" id="to-other">Other</Link>
    </nav>
  )
}
