'use client'
import { theme as commonTheme } from '@genshin-optimizer/gi/theme'
import { createTheme } from '@mui/material'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const theme = createTheme({
  ...commonTheme,
  typography: {
    ...commonTheme.typography,
    fontFamily: roboto.style.fontFamily,
  },
})
export default theme
