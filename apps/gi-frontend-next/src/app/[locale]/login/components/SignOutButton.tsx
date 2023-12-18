import { Button } from '@mui/material'

import LogoutIcon from '@mui/icons-material/Logout'
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
