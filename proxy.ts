import { type NextRequest, NextResponse } from 'next/server'

const PROJECT_REF = 'yharweliruemjexmuuxn'

function isPublic(pathname: string) {
  if (pathname === '/') return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) return true
  if (/\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|json)$/i.test(pathname)) return true
  return false
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

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
