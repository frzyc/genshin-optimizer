'use client'
import { CardContent, CardHeader, Divider } from '@mui/material'

import { useSession } from 'next-auth/react'

import { CardThemed } from '@genshin-optimizer/ui-common'
import User from './components/User'
import LoginButton from './components/LoginButton'
export default function LoginPage() {
  const { data: session } = useSession()
  const userId = session?.user.userId
  return (
    <CardThemed>
      <CardHeader title="Login Page" />
      <Divider />
      <CardContent>
        {session && userId ? (
          <User session={session} userId={userId} />
        ) : (
          <LoginButton />
        )}
      </CardContent>
    </CardThemed>
  )
}
