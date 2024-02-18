import LogoutIcon from '@mui/icons-material/Logout'
import { Button } from '@mui/material'
import { signOut } from 'next-auth/react'
export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut()}
      startIcon={<LogoutIcon />}
      variant="contained"
    >
      Sign out
    </Button>
  )
}
