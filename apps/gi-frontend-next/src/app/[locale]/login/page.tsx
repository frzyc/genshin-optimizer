'use client'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, CardHeader, Divider } from '@mui/material'
import { useSession } from 'next-auth/react'

import LoginButton from './components/LoginButton'
import SignOutButton from './components/SignOutButton'
import User from './components/User'
export default function LoginPage() {
  const { data: session } = useSession()
  return (
    <CardThemed>
      <CardHeader title="Login Page" action={session && <SignOutButton />} />
      <Divider />
      <CardContent>
        {session ? <User session={session} /> : <LoginButton />}
      </CardContent>
    </CardThemed>
  )
}
