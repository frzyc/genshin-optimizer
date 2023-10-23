import { AppBar, Toolbar } from '@mui/material'
export default function Footer() {
  return (
    <AppBar
      position="static"
      color="transparent"
      variant="outlined"
      elevation={0}
    >
      <Toolbar disableGutters>Footer</Toolbar>
    </AppBar>
  )
}
