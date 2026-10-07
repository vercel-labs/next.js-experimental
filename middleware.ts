import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/csp')) return NextResponse.next()
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline';`
  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('content-security-policy', csp)
  const res = NextResponse.next({ request: { headers } })
  res.headers.set('content-security-policy', csp)
  return res
}
