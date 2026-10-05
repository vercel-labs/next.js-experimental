import { getItem, compute2, newFn231 } from '@/lib'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const it = await getItem(id)
  return <main>item:{it.title}:{compute2(3)}:{newFn231()}</main>
}
