import { Suspense } from 'react'
import {
  navigation,
  prefetch,
} from 'next/cache'

async function Deferred() {
  await prefetch()
  await navigation()
  return <p>deferred content</p>
}

export default function Page() {
  return (
    <Suspense fallback={<p>loading</p>}>
      <Deferred />
    </Suspense>
  )
}
