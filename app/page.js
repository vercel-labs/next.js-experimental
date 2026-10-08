import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li><Link id="link-a" href="/items/a">/items/a</Link></li>
      <li><Link id="link-b" href="/items/b">/items/b</Link></li>
    </ul>
  )
}
