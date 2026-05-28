import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const protectedRoutes = ['/', '/expenses', '/budgets', '/reports']
const authRoutes = ['/login', '/register']
const protectedApiRoutes = ['/api/expenses', '/api/budgets', '/api/categories', '/api/dashboard']

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Lấy đường dẫn cơ bản (ví dụ: '/expenses/new' -> '/expenses')
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  const isAuthRoute = authRoutes.includes(pathname)
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  let payload = null
  if (token) {
    payload = await verifyToken(token)
  }

  // Nếu truy cập route yêu cầu đăng nhập mà chưa có token -> redirect về login
  if (isProtectedRoute && !payload) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Nếu truy cập API yêu cầu đăng nhập mà chưa có token -> 401
  if (isProtectedApiRoute && !payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Nếu đã đăng nhập mà vào trang login/register -> redirect về home
  if (isAuthRoute && payload) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Cho request đi tiếp và đính kèm userId vào header nếu là API
  const response = NextResponse.next()
  if (payload && isProtectedApiRoute) {
    response.headers.set('x-user-id', payload.userId)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
