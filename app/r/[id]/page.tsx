import { redirect } from 'next/navigation'
export const instant = false
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect('/target?from=' + id)
}
