import Link from 'next/link'
export default function Home() {
  return (
    <main>
      <h1 data-testid="home">Home</h1>
      <Link href="/dashboard">Dashboard</Link>
    </main>
  )
}
