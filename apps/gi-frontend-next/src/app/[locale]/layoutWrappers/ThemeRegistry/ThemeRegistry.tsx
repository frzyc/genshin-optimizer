'use client'
import { CssBaseline } from '@mui/material'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import * as React from 'react'

import theme from './theme'
export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
