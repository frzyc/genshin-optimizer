import { Container, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'
import Footer from './Footer'
import Header from './Header'

export const metadata = {
  title: 'Next.js App Router + Material UI v5',
  description: 'Next.js App Router + Material UI v5',
}

export default function Content({ children }: { children: React.ReactNode }) {
  return (
    <Stack minHeight="100vh" spacing={{ xs: 0.5, sm: 1, md: 2 }}>
      <Header />

      {/* <Box></Box> */}
      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
        {children}
      </Container>
      {/* make sure footer is always at bottom */}
      <Box flexGrow={1} />
      <Footer />
    </Stack>
  )
}
