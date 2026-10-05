import { NextResponse } from 'next/server'

// Middleware makes the client resolve rewrites from the matched path header,
// which is where a non-ASCII pathname used to break.
export function middleware() {
  return NextResponse.next()
}
