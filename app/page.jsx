import { Suspense } from 'react'
import Nav from './nav'
import Slow from './slow'
import ClientBox from './client-box'
export default function Page() {
  return (
    <main>
      <h1 id="title">Home</h1>
      <Nav />
      {/* rendered in the initial shell (no streaming) */}
      <ClientBox label="shell" />
      {/* streamed in later through Suspense */}
      <Suspense fallback={<p>loading home…</p>}>
        <Slow label="home" />
      </Suspense>
    </main>
  )
}
