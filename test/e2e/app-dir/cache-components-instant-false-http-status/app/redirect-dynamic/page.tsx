import { redirect } from 'next/navigation'

// Opt out of an instant (prerendered) response.
export const instant = false

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await searchParams
  redirect('/')
}
