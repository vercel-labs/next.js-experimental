import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife({ revalidate: 60, expire: 300, stale: 30 })
  console.log('[repro] STATIC CACHED PAGE RENDERED ON SERVER')
  return <h1 id="static-cached">Fully static cached page</h1>
}
