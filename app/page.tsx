import { getGreeting } from '@/lib/data'

export default async function Page() {
  return (
    <main>
      <h1 id="greeting">{getGreeting()}</h1>
    </main>
  )
}
