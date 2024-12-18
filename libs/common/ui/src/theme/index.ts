'use client'
import { createTheme } from '@mui/material'

declare module '@mui/material/styles' {
  interface Palette {
    warning: Palette['primary']
    contentNormal: Palette['primary']
    contentDark: Palette['primary']
    contentLight: Palette['primary']

    white: Palette['primary']
    red: Palette['primary']

    discord: Palette['primary']
    patreon: Palette['primary']
    twitch: Palette['primary']
    twitter: Palette['primary']
    paypal: Palette['primary']
    keqing: Palette['primary']

    brand500: Palette['primary']
    neutral100: Palette['primary']
    neutral200: Palette['primary']
    neutral300: Palette['primary']
    neutral400: Palette['primary']
    neutral500: Palette['primary']
    neutral600: Palette['primary']
    neutral700: Palette['primary']
    neutral800: Palette['primary']
    neutral900: Palette['primary']

    roll1: Palette['primary']
    roll2: Palette['primary']
    roll3: Palette['primary']
    roll4: Palette['primary']
    roll5: Palette['primary']
    roll6: Palette['primary']

    rarity1: Palette['primary']
    rarity2: Palette['primary']
    rarity3: Palette['primary']
    rarity4: Palette['primary']
    rarity5: Palette['primary']
  }

  interface PaletteOptions {
    warning?: PaletteOptions['primary']
    contentNormal?: PaletteOptions['primary']
    contentDark?: PaletteOptions['primary']
    contentLight?: PaletteOptions['primary']
    white?: PaletteOptions['primary']
    red?: PaletteOptions['primary']

    discord?: PaletteOptions['primary']
    patreon?: PaletteOptions['primary']
    twitch?: PaletteOptions['primary']
    twitter?: PaletteOptions['primary']
    paypal?: PaletteOptions['primary']
    keqing?: PaletteOptions['primary']

    brand500?: Palette['primary']
    neutral100?: Palette['primary']
    neutral200?: Palette['primary']
    neutral300?: Palette['primary']
    neutral400?: Palette['primary']
    neutral500?: Palette['primary']
    neutral600?: Palette['primary']
    neutral700?: Palette['primary']
    neutral800?: Palette['primary']
    neutral900?: Palette['primary']

    roll1?: PaletteOptions['primary']
    roll2?: PaletteOptions['primary']
    roll3?: PaletteOptions['primary']
    roll4?: PaletteOptions['primary']
    roll5?: PaletteOptions['primary']
    roll6?: PaletteOptions['primary']

    rarity1?: PaletteOptions['primary']
    rarity2?: PaletteOptions['primary']
    rarity3?: PaletteOptions['primary']
    rarity4?: PaletteOptions['primary']
    rarity5?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    warning: true
    white: true
    red: true

    discord: true
    patreon: true
    twitch: true
    twitter: true
    paypal: true
    keqing: true

    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true

    neutral100: true
    neutral200: true
    neutral300: true
    neutral400: true
    neutral500: true
    neutral600: true
    neutral700: true
    neutral800: true
    neutral900: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    warning: true
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    warning: true
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
  }
}

declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides {
    roll1: true
    roll2: true
    roll3: true
    roll4: true
    roll5: true
    roll6: true
  }
}

const defaultTheme = createTheme({
  palette: {
    tonalOffset: 0.1,
    mode: `dark`,
  },
})
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: defaultTheme.palette.augmentColor({
      color: { main: '#1e78c8' },
      name: 'primary',
    }),
    secondary: defaultTheme.palette.augmentColor({
      color: { main: '#6c757d' },
      name: 'secondary',
    }),
    success: defaultTheme.palette.augmentColor({
      color: { main: '#46a046' },
      name: 'success',
    }),
    warning: defaultTheme.palette.augmentColor({
      color: { main: `#ffc107` },
      name: 'warning',
    }),
    error: defaultTheme.palette.augmentColor({
      color: { main: `#c83c3c` },
      name: 'error',
    }),
    background: {
      default: '#0C1020',
      paper: '#0C1020',
    },
    info: defaultTheme.palette.augmentColor({
      color: { main: '#17a2b8' },
      name: 'info',
    }),
    text: {
      primary: 'rgba(255,255,255,0.9)',
    },
    contentNormal: defaultTheme.palette.augmentColor({
      color: { main: '#1b263b' },
      name: 'contentNormal',
    }),
    contentDark: defaultTheme.palette.augmentColor({
      color: { main: '#172032' },
      name: 'contentDark',
    }),
    contentLight: defaultTheme.palette.augmentColor({
      color: { main: '#2a364d' },
      name: 'contentLight',
    }),

    white: defaultTheme.palette.augmentColor({
      color: { main: '#FFFFFF' },
      name: 'white',
    }),
    red: defaultTheme.palette.augmentColor({
      color: { main: '#ff0000' },
      name: 'red',
    }),

    discord: defaultTheme.palette.augmentColor({
      color: { main: '#5663F7' },
      name: 'discord',
    }),
    patreon: defaultTheme.palette.augmentColor({
      color: { main: '#f96854', contrastText: '#ffffff' },
      name: 'patreon',
    }),
    twitch: defaultTheme.palette.augmentColor({
      color: { main: '#6441a5' },
      name: 'twitch',
    }),
    twitter: defaultTheme.palette.augmentColor({
      color: { main: '#55acee', contrastText: '#ffffff' },
      name: 'twitter',
    }),
    paypal: defaultTheme.palette.augmentColor({
      color: { main: '#00457C' },
      name: 'paypal',
    }),
    keqing: defaultTheme.palette.augmentColor({
      color: { main: '#584862' },
      name: 'keqing',
    }),

    brand500: defaultTheme.palette.augmentColor({
      color: { main: '#324599' },
      name: 'primary',
    }),
    neutral100: defaultTheme.palette.augmentColor({
      color: { main: '#E9EBF5' },
    }),
    neutral200: defaultTheme.palette.augmentColor({
      color: { main: '#CBCFE1' },
    }),
    neutral300: defaultTheme.palette.augmentColor({
      color: { main: '#A2A6BB' },
    }),
    neutral400: defaultTheme.palette.augmentColor({
      color: { main: '#777B8E' },
    }),
    neutral500: defaultTheme.palette.augmentColor({
      color: { main: '#393C4F' },
    }),
    neutral600: defaultTheme.palette.augmentColor({
      color: { main: '#222533' },
    }),
    neutral700: defaultTheme.palette.augmentColor({
      color: { main: '#191C2B' },
      name: 'primary',
    }),
    neutral800: defaultTheme.palette.augmentColor({
      color: { main: '#0C0F1A' },
      name: 'primary',
    }),
    neutral900: defaultTheme.palette.augmentColor({
      color: { main: '#020515' },
      name: 'primary',
    }),

    roll1: defaultTheme.palette.augmentColor({
      color: { main: '#a3a7a9' },
      name: 'roll1',
    }),
    roll2: defaultTheme.palette.augmentColor({
      color: { main: '#6fa376' },
      name: 'roll2',
    }),
    roll3: defaultTheme.palette.augmentColor({
      color: { main: '#8eea83' },
      name: 'roll3',
    }),
    roll4: defaultTheme.palette.augmentColor({
      color: { main: '#31e09d' },
      name: 'roll4',
    }),
    roll5: defaultTheme.palette.augmentColor({
      color: { main: '#27bbe4' },
      name: 'roll5',
    }),
    roll6: defaultTheme.palette.augmentColor({
      color: { main: '#de79f0' },
      name: 'roll6',
    }),

    rarity1: defaultTheme.palette.augmentColor({
      color: { main: '#838f99', contrastText: '#fff' },
      name: 'rarity1',
    }),
    rarity2: defaultTheme.palette.augmentColor({
      color: { main: '#5e966c', contrastText: '#fff' },
      name: 'rarity2',
    }),
    rarity3: defaultTheme.palette.augmentColor({
      color: { main: '#499fb3', contrastText: '#fff' },
      name: 'rarity3',
    }),
    rarity4: defaultTheme.palette.augmentColor({
      color: { main: '#b886ca', contrastText: '#fff' },
      name: 'rarity4',
    }),
    rarity5: defaultTheme.palette.augmentColor({
      color: { main: '#e6ac54', contrastText: '#fff' },
      name: 'rarity5',
    }),
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        enableColorOnDark: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: 'contained',
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
          marginTop: defaultTheme.spacing(1),
          marginBottom: defaultTheme.spacing(1),
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '& ul': {
            margin: 0,
            paddingLeft: defaultTheme.spacing(3),
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          [defaultTheme.breakpoints.down('sm')]: {
            padding: defaultTheme.spacing(1),
            '&:last-child': {
              paddingBottom: defaultTheme.spacing(1),
            },
          },
          [defaultTheme.breakpoints.up('sm')]: {
            '&:last-child': {
              paddingBottom: defaultTheme.spacing(2),
            },
          },
        },
      },
    },
  },
})
