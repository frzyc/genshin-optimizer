import { AppBar, Container, Stack, Toolbar } from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'

export const metadata = {
  title: 'Next.js App Router + Material UI v5',
  description: 'Next.js App Router + Material UI v5',
}

export default async function Content({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Stack minHeight="100vh" spacing={{ xs: 0.5, sm: 1, md: 2 }}>
      {/* Header */}
      <AppBar position="static" color="transparent" variant="outlined">
        <Toolbar disableGutters>Header</Toolbar>
      </AppBar>

      {/* <Box></Box> */}
      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
        {children}
      </Container>
      {/* make sure footer is always at bottom */}
      <Box flexGrow={1} />
      {/* footer */}
      <AppBar position="static" color="transparent" variant="outlined">
        <Toolbar disableGutters>Footer</Toolbar>
      </AppBar>
    </Stack>
  )
}
