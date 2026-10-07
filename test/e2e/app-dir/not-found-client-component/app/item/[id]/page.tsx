'use client'

import { notFound, useParams } from 'next/navigation'

export default function ItemPage() {
  const { id } = useParams<{ id: string }>()

  if (id !== '1') {
    notFound()
  }

  return <p id="item">item {id}</p>
}
