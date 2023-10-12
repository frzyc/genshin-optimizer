import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Typography } from '@mui/material'
import { signOut, useSession } from 'next-auth/react'
export default function User() {
  const { data } = useSession()
  return (
    <>
      <Typography>{data?.user?.name}</Typography>
      <Typography>{data?.user?.email}</Typography>
      <Button
        onClick={() => signOut()}
        startIcon={<LogoutIcon />}
        variant="contained"
      >
        Sign out
      </Button>
    </>
  )
}
