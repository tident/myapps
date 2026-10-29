import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil cookie
  const session = request.cookies.get('user_session')

  // Cek jika URL mengandung /dashboard tapi tidak ada session
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Jika sudah login tapi buka /login, lempar ke dashboard
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Matcher untuk memastikan middleware berjalan di halaman ini
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}