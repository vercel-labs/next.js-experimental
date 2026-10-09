import Link from 'next/link'
import { PageTransition } from './page-transition'

export default function Home() {
  return (
    <main>
      <h1 data-testid="home">Home</h1>
      <PageTransition>
        <Link prefetch={true} href="/post/1" data-testid="link-push">
          Go to post 1 (intercepted via router.push)
        </Link>
      </PageTransition>
      <p>
        <Link prefetch={true} href="/post/2" data-testid="link-plain">
          Go to post 2 (plain Link click)
        </Link>
      </p>
    </main>
  )
}
