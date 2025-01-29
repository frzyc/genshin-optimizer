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
      color: { main: '#e83e3e', contrastText: '#fff' },
      name: 'fire',
    }),
    ice: commonTheme.palette.augmentColor({
      color: { main: '#1fb6d1' },
      name: 'ice',
    }),
    electric: commonTheme.palette.augmentColor({
      color: { main: '#bb4cd3' },
      name: 'electric',
    }),
    frost: commonTheme.palette.augmentColor({
      color: { main: '#1b9eb5' },
      name: 'frost',
    }),
    physical: commonTheme.palette.augmentColor({
      color: { main: '#acabab' },
      name: 'physical',
    }),
    ether: commonTheme.palette.augmentColor({
      color: { main: '#736ae6', contrastText: '#fff' },
      name: 'ether',
    }),
  },
})
