import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Csak API útvonalakra alkalmazzuk
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Kihagyjuk az auth és register végpontokat
  if (request.nextUrl.pathname.includes('/api/auth/') || 
      request.nextUrl.pathname.includes('/api/admin/set-roles')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Optimalizált cache beállítások
  if (request.nextUrl.pathname.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    '/api/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
}