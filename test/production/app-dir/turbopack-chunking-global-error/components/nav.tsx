'use client'

import Link from 'next/link'
import { useTheme } from './theme'

export function Nav() {
  const theme = useTheme()
  return (
    <nav id="nav" data-theme={theme}>
      <Link href="/">home</Link>
      <Link href="/plain">plain</Link>
    </nav>
  )
}
