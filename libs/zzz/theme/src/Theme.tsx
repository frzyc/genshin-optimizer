import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
    contentZzz: Palette['primary']
    fire: Palette['primary']
    ice: Palette['primary']
    electric: Palette['primary']
    frost: Palette['primary']
    physical: Palette['primary']
    ether: Palette['primary']
    rankS: Palette['primary']
    rankA: Palette['primary']
    rankB: Palette['primary']
  }

  interface PaletteOptions {
    contentZzz?: PaletteOptions['primary']
    fire?: PaletteOptions['primary']
    ice?: PaletteOptions['primary']
    electric?: PaletteOptions['primary']
    frost?: PaletteOptions['primary']
    physical?: PaletteOptions['primary']
    ether?: PaletteOptions['primary']
    rankS?: PaletteOptions['primary']
    rankA?: PaletteOptions['primary']
    rankB?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    fire: true
    ice: true
    electric: true
    frost: true
    physical: true
    ether: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    fire: true
    ice: true
    electric: true
    frost: true
    physical: true
    ether: true
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    fire: true
    ice: true
    electric: true
    frost: true
    physical: true
    ether: true
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    fire: true
    ice: true
    electric: true
    frost: true
    physical: true
    ether: true
  }
}

export const theme = createTheme({
  ...commonTheme,
  typography: {
    button: {
      textTransform: 'none',
    },
    fontFamily: '"Inter", sans-serif',
  },
  palette: {
    ...commonTheme.palette,
    contentZzz: commonTheme.palette.augmentColor({
      color: { main: '#2B364D', contrastText: '#fff' },
      name: 'contentZzz',
    }),
    fire: commonTheme.palette.augmentColor({
      color: { main: '#FF5623', contrastText: '#fff' },
      name: 'fire',
    }),
    ice: commonTheme.palette.augmentColor({
      color: { main: '#95EAE9', contrastText: '#fff' },
      name: 'ice',
    }),
    electric: commonTheme.palette.augmentColor({
      color: { main: '#0177FF', contrastText: '#fff' },
      name: 'electric',
    }),
    frost: commonTheme.palette.augmentColor({
      color: { main: '#719EF8', contrastText: '#fff' },
      name: 'frost',
    }),
    physical: commonTheme.palette.augmentColor({
      color: { main: '#EDCC2C', contrastText: '#fff' },
      name: 'physical',
    }),
    ether: commonTheme.palette.augmentColor({
      color: { main: '#FE427E', contrastText: '#fff' },
      name: 'ether',
    }),
    rankS: commonTheme.palette.augmentColor({
      color: { main: '#FF9100', contrastText: '#fff' },
      name: 'rankS',
    }),
    rankA: commonTheme.palette.augmentColor({
      color: { main: '#E900FF', contrastText: '#fff' },
      name: 'rankA',
    }),
    rankB: commonTheme.palette.augmentColor({
      color: { main: '#14a9fe', contrastText: '#fff' },
      name: 'rankB',
    }),
  },
  shape: {
    borderRadius: 20,
  },
})
