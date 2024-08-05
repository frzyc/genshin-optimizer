'use client'
import { Box } from '@mui/material'
import Footer from './components/Footer'
import Header from './components/Header'
import './global.css'

export default function Content({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      position="relative"
      sx={(theme) => ({
        background: `radial-gradient(ellipse at top, ${theme.palette.neutral700.main} 0%, ${theme.palette.neutral800.main} 100%)`,
      })}
    >
      <Header />
      {children}
      {/* make sure footer is always at bottom */}
      <Box flexGrow={1} />
      <Footer />
    </Box>
  )
}
