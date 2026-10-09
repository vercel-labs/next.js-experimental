import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
export const instant = false
export default async function Page() {
  const c = await cookies()
  redirect('/target?c=' + (c.get('x')?.value ?? 'none'))
}
