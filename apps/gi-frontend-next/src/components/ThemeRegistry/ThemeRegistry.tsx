'use client'
import * as React from 'react'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import NextAppDirEmotionCacheProvider from './EmotionCache'
import theme from './theme'
import { CssBaseline } from '@mui/material'

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  )
}
