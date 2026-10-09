import { cacheLife } from 'next/cache'

export async function getSiteName() {
  'use cache'
  cacheLife({ revalidate: 3 * 60 * 60 })
  return 'Repro Site'
}
