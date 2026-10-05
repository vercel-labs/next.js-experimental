import { recurse } from './lib'

export default async function OverflowPage() {
  const value = recurse(0)
  return <p>{value}</p>
}
