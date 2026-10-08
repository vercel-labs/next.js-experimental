import { Suspense } from 'react'

export function generateStaticParams() {
  return [{ slug: 'a' }, { slug: 'b' }]
}

async function Item({ params }) {
  const { slug } = await params
  return <h1 id="title">Item {slug}</h1>
}

export default function Page(props) {
  return (
    <Suspense fallback={<p>loading…</p>}>
      <Item params={props.params} />
    </Suspense>
  )
}
