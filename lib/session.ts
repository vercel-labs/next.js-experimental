import { cookies } from 'next/headers'

export type Session = { token: string | null }

// Typical "optional session" helper: reads request-time cookies and
// tolerates environments where cookies are unavailable.
export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies()
    return { token: cookieStore.get('token')?.value ?? null }
  } catch (err) {
    console.error('[getSession] failed to read cookies', err)
    return { token: null }
  }
}
