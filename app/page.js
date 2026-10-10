import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>Prefetch reproduction</h1>
      <p id="trigger"><Link href="/items/trigger" prefetch={true}>Trigger: next/link (prefetch enabled)</Link></p>
      <p id="control"><Link href="/items/control" prefetch={false}>Control: next/link (prefetch disabled)</Link></p>
    </main>
  )
}
