'use client'
import { CardContent, CardHeader, Divider } from '@mui/material'

import { useSession } from 'next-auth/react'

import { CardThemed } from '@genshin-optimizer/ui-common'
import Auth from './components/Auth'
import LoginButton from './components/LoginButton'
export default function LoginPage() {
  const { data: session } = useSession()
  const dbId = session?.user.dbId
  return (
    <CardThemed>
      <CardHeader title="Login Page" />
      <Divider />
      <CardContent>
        {session && dbId ? (
          <Auth session={session} dbId={dbId} />
        ) : (
          <LoginButton />
        )}
      </CardContent>
    </CardThemed>
  )
}
