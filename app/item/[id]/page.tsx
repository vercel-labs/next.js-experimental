import { notFound } from 'next/navigation'
export const instant = false
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id !== 'known') notFound()
  return <p>item {id}</p>
}
