import { NextResponse } from 'next/server';

// Auth is now handled client-side via AuthProvider.
// This middleware only handles basic redirects.
export async function middleware() {
  // Let all requests pass through — auth is handled by the React AuthProvider
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
};
