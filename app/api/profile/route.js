import { getToken } from '../../../lib/session'

export async function GET() {
  try {
    const token = await getToken()
    return Response.json({ token })
  } catch (err) {
    // app-level error reporting (Sentry/console) sees the build-time rejection
    console.error('[/api/profile failed]', err)
    return Response.json({ error: 'failed' }, { status: 500 })
  }
}
