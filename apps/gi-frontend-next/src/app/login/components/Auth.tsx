import { useGetUserQuery } from '@genshin-optimizer/gi-frontend-gql'
import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Stack, Typography } from '@mui/material'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import UsernameForm from './UsernameForm'
export default function Auth({
  dbId,
  session,
}: {
  dbId: string
  session: Session
}) {
  const { data, loading, error } = useGetUserQuery({
    variables: {
      dbId: dbId,
    },
  })
  if (loading) return null //TODO:suspense
  if (error) return null //TODO: error
  const username = data?.getUserById?.username

  return (
    <Stack spacing={2} alignItems="center">
      {username ? (
        <Typography>
          Logged in as <strong>{username}</strong>.
        </Typography>
      ) : (
        <Typography>
          Logged in as <strong>{session.user.email}</strong>.
        </Typography>
      )}

      {!username && <UsernameForm dbId={dbId} />}

      <Button
        onClick={() => signOut()}
        startIcon={<LogoutIcon />}
        variant="contained"
      >
        Sign out
      </Button>
    </Stack>
  )
}
