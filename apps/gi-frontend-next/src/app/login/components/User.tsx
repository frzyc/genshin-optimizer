import { useGetUserQuery } from '@genshin-optimizer/gi-frontend-gql'
import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Stack, Typography } from '@mui/material'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import UsernameForm from './UsernameForm'
import UIDForm from './UIDForm'

export default function User({
  userId,
  session,
}: {
  userId: string
  session: Session
}) {
  const { data, loading, error } = useGetUserQuery({
    variables: {
      userId,
    },
  })
  if (loading) return null //TODO:suspense
  if (error) return null //TODO: error
  const user = data?.getUserById
  if (!user) return null

  const { username, genshinUsers } = user
  console.log('user', { username, genshinUsers })
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
      {!username && <UsernameForm userId={userId} />}
      <Typography>
        UIDS: {genshinUsers?.map(({ uid }) => uid).join(' ,')}
      </Typography>
      {username && <UIDForm userId={userId} />}
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
