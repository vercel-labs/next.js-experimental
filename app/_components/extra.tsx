import * as data from '@/lib'

export async function Extra() {
  'use cache'
  const title = await data.getTitle()
  return <div id="extra">extra:{title}</div>
}
