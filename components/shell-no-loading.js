'use client'
import dynamic from 'next/dynamic'
import Counter from './counter'

const Heavy = dynamic(() => import('./heavy'), { ssr: true })

export default function ClientShell() {
  return (
    <div>
      <Counter />
      <Heavy />
    </div>
  )
}
