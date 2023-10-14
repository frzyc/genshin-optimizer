import { useCreateUsernameMutation } from '@genshin-optimizer/gi-frontend-gql'
import { CardThemed } from '@genshin-optimizer/ui-common'
import GoogleIcon from '@mui/icons-material/Google'
import {
  Button,
  CardContent,
  Input,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { Session } from 'next-auth'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
export default function Auth({
  session,
  reloadSession,
}: {
  session: Session | null
  reloadSession: () => void
}) {
  const [username, setusername] = useState('')
  const [createUsernameMutation, { data, loading, error }] =
    useCreateUsernameMutation({
      variables: {
        username,
      },
    })
  console.log('useCreateUsernameMutation', { data, loading, error })
  const onSubmit = async () => {
    console.log('onSubmit')
    try {
      createUsernameMutation()
    } catch (e) {
      console.error(e)
    }
  }

  if (!session)
    return (
      <Button // not logged in
        onClick={() => signIn('google')}
        startIcon={<GoogleIcon />}
        variant="contained"
      >
        Sign In
      </Button>
    )
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={2}>
          <Typography>Create a Username</Typography>
          <TextField
            placeholder="Enter a Username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
          <Button variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
