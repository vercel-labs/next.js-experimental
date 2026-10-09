import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>Turbopack lazy dynamic imports repro</h1>
      <ul>
        <li>
          <Link href="/a">/a</Link>
        </li>
        <li>
          <Link href="/b">/b</Link>
        </li>
      </ul>
    </main>
  )
}
