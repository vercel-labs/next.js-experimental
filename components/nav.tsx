'use client'
import Link from 'next/link'
import { useTheme } from './theme'

export const NAV_MARKER = 'NAV_LINKS_UNIQUE_MARKER_3b7c'

export function Nav() {
  const { theme, toggle } = useTheme()
  return (
    <nav data-marker={NAV_MARKER}>
      <Link href="/">Home</Link>
      <Link href="/plain">Plain</Link>
      <button onClick={toggle}>{theme}</button>
    </nav>
  )
}
