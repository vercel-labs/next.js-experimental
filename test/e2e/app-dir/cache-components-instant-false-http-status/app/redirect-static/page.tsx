import { redirect } from 'next/navigation'

// Opt out of an instant (prerendered) response. This page reads no request
// data, so its shell is still fully prerenderable.
export const instant = false

export default async function Page() {
  redirect('/')
}
