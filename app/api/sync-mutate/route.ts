import { revalidateTag } from 'next/cache'
import { writeValue } from '../../../lib/db'

// Control: mutation + revalidateTag complete before the Response is returned.
export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get('value') ?? 'mutated'
  await writeValue(value)
  revalidateTag('data', { expire: 0 })
  return Response.json({ ok: true })
}
