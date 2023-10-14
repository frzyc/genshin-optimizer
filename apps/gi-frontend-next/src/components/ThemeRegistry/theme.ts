import { Roboto } from 'next/font/google'
import { createTheme } from '@mui/material/styles'
import { theme as commonTheme } from '@genshin-optimizer/ui-common'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const theme = createTheme({
  ...commonTheme,
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
})

export default theme
