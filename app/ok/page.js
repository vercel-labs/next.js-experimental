import { Suspense } from 'react'
import DynamicOk from './dynamic-ok'

// Control route: identical shape, but the client components do NOT throw.
export default function Page() {
  const items = [1, 2, 3, 4, 5, 6]
  return (
    <main>
      {items.map((i) => (
        <Suspense key={i} fallback={<p>loading {i}</p>}>
          <DynamicOk id={i} />
        </Suspense>
      ))}
    </main>
  )
}
