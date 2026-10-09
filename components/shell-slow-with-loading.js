'use client'
import dynamic from 'next/dynamic'
import Counter from './counter'

const Heavy = dynamic(
  async () => { await new Promise((r) => setTimeout(r, 300)); return import('./heavy') },
  { ssr: true, loading: () => null }
)

export default function ClientShell() {
  return (<div><Counter /><Heavy /></div>)
}
