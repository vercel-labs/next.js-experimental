'use client'
import dynamic from 'next/dynamic'
import { Nav } from '../components/nav'

const Heavy = dynamic(() => import('../components/heavy'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Nav />
      <Heavy />
    </main>
  )
}
