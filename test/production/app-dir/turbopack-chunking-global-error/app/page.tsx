import dynamic from 'next/dynamic'

const Lazy = dynamic(() => import('../components/lazy'))

export default function Page() {
  return (
    <main id="home">
      home
      <Lazy />
    </main>
  )
}
