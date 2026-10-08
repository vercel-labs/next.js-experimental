import { cookies } from 'next/headers'

// server-side helper used by route handlers to read the request session
export async function getToken() {
  const store = await cookies()
  return store.get('token')?.value ?? null
}
