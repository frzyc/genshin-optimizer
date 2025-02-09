import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
    fire: Palette['primary']
    ice: Palette['primary']
    electric: Palette['primary']
    frost: Palette['primary']
    physical: Palette['primary']
    ether: Palette['primary']
  }

  interface PaletteOptions {
    fire?: PaletteOptions['primary']
    ice?: PaletteOptions['primary']
    electric?: PaletteOptions['primary']
    frost?: PaletteOptions['primary']
    physical?: PaletteOptions['primary']
    ether?: PaletteOptions['primary']
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
  palette: {
    ...commonTheme.palette,
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
  },
  shape: {
    borderRadius: 20,
  },
})
