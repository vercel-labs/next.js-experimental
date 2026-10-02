import Link from 'next/link'

const slugs = Array.from({ length: 20 }, (_, i) => `novel-${i + 1}`)

export default function Home() {
  return (
    <main>
      <h1 id="home">home</h1>
      <ul>
        {slugs.map((s) => (
          <li key={s}>
            <Link id={`to-blocking-${s}`} prefetch={false} href={`/blocking/${s}`}>
              blocking {s}
            </Link>{' '}
            <Link id={`to-fallback-${s}`} prefetch={false} href={`/fallback/${s}`}>
              fallback {s}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
