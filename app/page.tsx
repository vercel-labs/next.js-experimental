import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1 id="home">Home</h1>
      <ul>
        <li>
          <Link id="valid-link" href="/item/1">
            valid item (client nav)
          </Link>
        </li>
        <li>
          <Link id="invalid-link" href="/item/nope">
            invalid item (client nav -&gt; notFound)
          </Link>
        </li>
      </ul>
    </main>
  )
}
