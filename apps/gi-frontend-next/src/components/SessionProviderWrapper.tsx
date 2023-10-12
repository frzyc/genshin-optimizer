'use client'

import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

export function SessionProviderWrapper({
  children,
  session,
}: {
  children: JSX.Element
  session: Session | null
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
