import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './i18n/settings'

acceptLanguage.languages(languages)

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}

export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.indexOf('icon') > -1 ||
    req.nextUrl.pathname.indexOf('chrome') > -1 ||
    req.nextUrl.pathname.indexOf('genshin_fast_09_04_21') > -1
  )
    return NextResponse.next()
  let lng

  const cookie = req.cookies.get(cookieName)
  if (cookie) lng = acceptLanguage.get(cookie.value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    if (!req.nextUrl.pathname) return NextResponse.redirect(new URL(`/${lng}`))
    else
      return NextResponse.redirect(
        new URL(
          // match /zz/ or /zz and replace with /lng/
          req.nextUrl.pathname.replace(/\/(.*)\/|\/(.*)$/, `/${lng}/`),
          req.url
        )
      )
  }

  const referer = req.headers.get('referer')
  if (referer) {
    const refererUrl = new URL(referer)
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    )
    const response = NextResponse.next()
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next()
}
