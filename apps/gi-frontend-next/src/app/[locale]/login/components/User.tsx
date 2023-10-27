import { useGetUserQuery } from '@genshin-optimizer/gi-frontend-gql'
import { Stack, Typography } from '@mui/material'
import type { Session } from 'next-auth'
import UIDForm from './UIDForm'
import UsernameForm from './UsernameForm'

export default function User({ session }: { session: Session }) {
  const userId = session.user.userId
  const { data, loading, error } = useGetUserQuery({
    variables: {
      userId,
    },
  })
  console.log({ data, loading, error })
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
    </Stack>
  )
}
