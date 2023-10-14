'use client'
import {
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

import { useSession } from 'next-auth/react'

import { CardThemed } from '@genshin-optimizer/ui-common'
import Auth from './components/Auth'
import User from './components/User'
export default function LoginPage() {
  const { data: session } = useSession()
  console.log('Login page', { data: session })
  const reloadSession = () => {} //TODO:
  return (
    <CardThemed>
      <CardHeader title="Login Page" />
      <Divider />
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Typography>
            Logged in as <strong>{session?.user.email}</strong>.
          </Typography>
          {session?.user?.username ? (
            <User />
          ) : (
            <Auth session={session} reloadSession={reloadSession} />
          )}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
