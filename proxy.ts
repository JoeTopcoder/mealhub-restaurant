import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/auth/login', '/auth/signup', '/auth/callback']
const PROJECT_REF = 'yharweliruemjexmuuxn'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()
  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) return NextResponse.next()

  const tokenCookie =
    request.cookies.get(`sb-${PROJECT_REF}-auth-token`) ||
    request.cookies.get(`sb-${PROJECT_REF}-auth-token.0`) ||
    request.cookies.get('sb-access-token')

  if (!tokenCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
