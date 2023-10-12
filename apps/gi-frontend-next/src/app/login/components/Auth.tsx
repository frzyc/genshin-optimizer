import GoogleIcon from '@mui/icons-material/Google'
import { Button, Input, TextField, Typography } from '@mui/material'
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

  const onSubmit = async () => {
    try {
      //TODO: GraphQL
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
    <>
      <Typography>Create a Username</Typography>
      <TextField
        placeholder="Enter a Username"
        value={username}
        onChange={(e) => setusername(e.target.value)}
      />
      <Button variant="contained">Submit</Button>
    </>
  )
}
