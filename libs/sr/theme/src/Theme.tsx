import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
    fire: Palette['primary']
    ice: Palette['primary']
    imaginary: Palette['primary']
    lightning: Palette['primary']
    physical: Palette['primary']
    quantum: Palette['primary']
    wind: Palette['primary']
    orange: Palette['primary']
    heal: Palette['primary']
    grad1: {
      gradient: string
    }
    grad2: {
      gradient: string
    }
    grad3: {
      gradient: string
    }
    grad4: {
      gradient: string
    }
    grad5: {
      gradient: string
    }
  }

  interface PaletteOptions {
    fire?: PaletteOptions['primary']
    ice?: PaletteOptions['primary']
    imaginary?: PaletteOptions['primary']
    lightning?: PaletteOptions['primary']
    physical?: PaletteOptions['primary']
    quantum?: PaletteOptions['primary']
    wind?: PaletteOptions['primary']
    orange?: Palette['primary']
    heal?: Palette['primary']
    grad1?: {
      gradient: string
    }
    grad2?: {
      gradient: string
    }
    grad3?: {
      gradient: string
    }
    grad4?: {
      gradient: string
    }
    grad5?: {
      gradient: string
    }
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
    heal: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
    heal: true
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
    heal: true
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
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
    imaginary: commonTheme.palette.augmentColor({
      color: { main: '#d6c146' },
      name: 'imaginary',
    }),
    lightning: commonTheme.palette.augmentColor({
      color: { main: '#bb4cd3' },
      name: 'lightning',
    }),
    physical: commonTheme.palette.augmentColor({
      color: { main: '#acabab' },
      name: 'physical',
    }),
    quantum: commonTheme.palette.augmentColor({
      color: { main: '#736ae6', contrastText: '#fff' },
      name: 'quantum',
    }),
    wind: commonTheme.palette.augmentColor({
      color: { main: '#3cc088', contrastText: '#fff' },
      name: 'wind',
    }),
    orange: commonTheme.palette.augmentColor({
      color: { main: '#f29e38', contrastText: '#fff' },
      name: 'orange',
    }),
    heal: commonTheme.palette.augmentColor({
      color: { main: '#c0e86c' },
      name: 'heal',
    }),
    grad1: {
      gradient: 'linear-gradient(to bottom right, #4f5864, #838f99)',
    },
    grad2: {
      gradient: 'linear-gradient(to bottom right, #48575c, #5e966c)',
    },
    grad3: {
      gradient: 'linear-gradient(to bottom right, #515474, #499fb3)',
    },
    grad4: {
      gradient: 'linear-gradient(to bottom right, #595482, #b886ca)',
    },
    grad5: {
      gradient: 'linear-gradient(to bottom right, #695453, #e6ac54)',
    },
  },
})
