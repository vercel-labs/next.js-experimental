import Link from 'next/link'

export default function Page() {
  return (
    <main>
      <Link href="/item/nope" id="to-invalid-item">
        invalid item
      </Link>
      <Link href="/item/1" id="to-valid-item">
        valid item
      </Link>
    </main>
  )
}
