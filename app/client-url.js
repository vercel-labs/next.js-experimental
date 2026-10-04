'use client'
import { useSearchParams } from 'next/navigation'

export default function ClientUrl() {
  const q = useSearchParams().get('q')
  return <p>query: {q}</p>
}
