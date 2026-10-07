'use client'

import { notFound, useParams } from 'next/navigation'

const VALID = new Set(['1', '2', '3'])

export default function ItemPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  if (!VALID.has(id)) {
    // notFound() called during a Client Component render
    notFound()
  }

  return <h1 id="item-ok">Item {id}</h1>
}
