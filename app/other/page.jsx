import { Suspense } from 'react'
import Nav from '../nav'
import Slow from '../slow'
export default function Page() {
  return (
    <main>
      <h1 id="title">Other</h1>
      <Nav />
      <Suspense fallback={<p>loading other…</p>}>
        <Slow label="other" />
      </Suspense>
    </main>
  )
}
