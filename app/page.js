import Link from 'next/link'

export default function Page() {
  return (
    <main>
      <h1>cacheComponents + client `new Date()`</h1>
      <ul>
        <li>
          <Link href="/effect-only">/effect-only</Link> — new Date() only inside
          useEffect (reported case, prerenders fine)
        </li>
        <li>
          <Link href="/effect-deps">/effect-deps</Link> — new Date() in the
          useEffect dependency array (render-time, fails the prerender)
        </li>
      </ul>
    </main>
  )
}
