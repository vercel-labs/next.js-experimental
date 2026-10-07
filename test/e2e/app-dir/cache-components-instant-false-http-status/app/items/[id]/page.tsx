import { notFound } from 'next/navigation'

// Opt out of an instant (prerendered) response.
export const instant = false

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id !== 'ok') {
    notFound()
  }

  return <p id="item">item {id}</p>
}
