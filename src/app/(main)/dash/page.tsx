import { getItems, compute1, newFn231 } from '@/lib'

export default async function Dash() {
  const items = await getItems()
  return <main>dash:{items.length}:{compute1(2)}:{newFn231()}</main>
}
