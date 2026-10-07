import Link from 'next/link'
import { ManualPrefetchLink } from './components/manual-prefetch-link'

export default function Home() {
  return (
    <main>
      <h1>Home</h1>
      <ul>
        <li>
          <ManualPrefetchLink href="/target-a" id="manual-default">
            Target A
          </ManualPrefetchLink>
        </li>
        <li>
          <ManualPrefetchLink href="/target-b" id="manual-full" kind="full">
            Target B
          </ManualPrefetchLink>
        </li>
        <li>
          <Link id="link-true" href="/target-c" prefetch={true}>
            Target C (Link prefetch=true)
          </Link>
        </li>
        <li>
          <Link id="link-auto" href="/target-d">
            Target D (Link default)
          </Link>
        </li>
      </ul>
    </main>
  )
}
