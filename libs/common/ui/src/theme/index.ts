'use client'
import { createTheme, darkScrollbar } from '@mui/material'

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
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    warning: true
  }
}
declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    warning: true
  }
}

const defaultTheme = createTheme({
  palette: {
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
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: defaultTheme.palette.mode === 'dark' ? darkScrollbar() : null,
      },
    },
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
