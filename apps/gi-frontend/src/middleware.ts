import { i18nRouter } from 'next-i18n-router'
import { type NextRequest } from 'next/server'
import { i18nConfig } from './i18nConfig'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // update user's auth session
  const response = i18nRouter(request, i18nConfig)

  return await updateSession(request, response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
