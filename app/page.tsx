import { cacheTag } from 'next/cache'
import { readValue } from '../lib/db'

async function getData() {
  'use cache'
  cacheTag('data')
  return { value: await readValue(), readAt: Date.now() }
}

export default async function Page() {
  const data = await getData()
  return (
    <main>
      <p id="value">{data.value}</p>
      <p id="readAt">{data.readAt}</p>
    </main>
  )
}
