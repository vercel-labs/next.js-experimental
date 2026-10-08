import Link from 'next/link'
export default function Home() {
  return (
    <ul>
      <li><Link href="/suspense-without-fallback">suspense-without-fallback</Link></li>
      <li><Link href="/with-fallback">with-fallback (control)</Link></li>
    </ul>
  )
}
