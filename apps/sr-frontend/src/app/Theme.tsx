import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common_ui'

declare module '@mui/material/styles' {
  interface Palette {
    roll1: Palette['primary']
    roll2: Palette['primary']
    roll3: Palette['primary']
    roll4: Palette['primary']
    roll5: Palette['primary']
    roll6: Palette['primary']
  }
  interface PaletteOptions {
    roll1?: PaletteOptions['primary']
    roll2?: PaletteOptions['primary']
    roll3?: PaletteOptions['primary']
    roll4?: PaletteOptions['primary']
    roll5?: PaletteOptions['primary']
    roll6?: PaletteOptions['primary']
    heal?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    warning: true
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
    heal: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
    heal: true
  }
}
declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    heal: true
  }
}

export const theme = createTheme({
  ...commonTheme,
  palette: {
    ...commonTheme.palette,
    roll1: commonTheme.palette.augmentColor({
      color: { main: '#a3a7a9' },
      name: 'roll1',
    }),
    roll2: commonTheme.palette.augmentColor({
      color: { main: '#6fa376' },
      name: 'roll2',
    }),
    roll3: commonTheme.palette.augmentColor({
      color: { main: '#8eea83' },
      name: 'roll3',
    }),
    roll4: commonTheme.palette.augmentColor({
      color: { main: '#31e09d' },
      name: 'roll4',
    }),
    roll5: commonTheme.palette.augmentColor({
      color: { main: '#27bbe4' },
      name: 'roll5',
    }),
    roll6: commonTheme.palette.augmentColor({
      color: { main: '#de79f0' },
      name: 'roll6',
    }),
    heal: commonTheme.palette.augmentColor({
      color: { main: '#c0e86c' },
      name: 'heal',
    }),
  },
})
