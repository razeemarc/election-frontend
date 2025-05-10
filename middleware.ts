import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname
  
  // Check if we're trying to access dashboard routes
  const isDashboardRoute = path.startsWith('/dashboard')
  
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value
  
  // If trying to access dashboard without a token, redirect to auth
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // For client-side role checking, we'll rely on the userStore in the component
  // This middleware just ensures authentication is present for protected routes
  
  return NextResponse.next()
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*'],
}