import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_WM_PATHS = ['/wm/login', '/wm/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/wm')) {
    return NextResponse.next()
  }

  // Allow login/register without a session
  if (PUBLIC_WM_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('wm_session')?.value

  if (!token) {
    const loginUrl = new URL('/wm/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.WM_JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/wm/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('wm_session')
    return response
  }
}

export const config = {
  matcher: ['/wm/:path*'],
}
