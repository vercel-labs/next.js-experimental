import { Suspense } from 'react'
import DynamicThrower from './dynamic-thrower'

export default function Page() {
  const items = [1, 2, 3, 4, 5, 6]
  return (
    <main>
      {items.map((i) => (
        <Suspense key={i} fallback={<p>loading {i}</p>}>
          <DynamicThrower id={i} />
        </Suspense>
      ))}
    </main>
  )
}
