import GoogleIcon from '@mui/icons-material/Google'
import { Button } from '@mui/material'
import { signIn } from 'next-auth/react'

export default function LoginButton() {
  return (
    <Button // not logged in
      onClick={() => signIn('google')}
      startIcon={<GoogleIcon />}
      variant="contained"
    >
      Sign In
    </Button>
  )
}
