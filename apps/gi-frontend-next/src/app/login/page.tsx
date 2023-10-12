'use client'
import { Stack } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useSession } from 'next-auth/react'

import Auth from './components/Auth'
import User from './components/User'
export default function LoginPage() {
  const { data: session } = useSession()
  console.log('Login page', { data: session })
  const reloadSession = () => {} //TODO:
  return (
    <Container>
      <Stack spacing={2} alignItems="center">
        <Typography variant="body1" gutterBottom>
          Login Page
        </Typography>

        {session?.user?.username ? (
          <User />
        ) : (
          <Auth session={session} reloadSession={reloadSession} />
        )}
      </Stack>
    </Container>
  )
}
