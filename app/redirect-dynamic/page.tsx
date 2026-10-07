import { redirect } from 'next/navigation'
export const instant = false
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams
  redirect(to ?? '/')
}
