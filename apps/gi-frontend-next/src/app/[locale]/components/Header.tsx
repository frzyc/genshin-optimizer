import { AppBar, Toolbar } from '@mui/material'
export default function Header() {
  return (
    <AppBar
      position="static"
      color="transparent"
      variant="outlined"
      elevation={0}
    >
      <Toolbar disableGutters>Header</Toolbar>
    </AppBar>
  )
}
