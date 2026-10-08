import { Suspense } from 'react'
import { lib } from '../../lib/big'

async function C() {
  'use cache'
  return <p data-testid="about">about {lib()} </p>
}

export default function Page() {
  return <Suspense fallback={<p>loading</p>}><C /></Suspense>
}
