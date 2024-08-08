import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
    brandSRO500: Palette['primary']
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
    fire: Palette['primary']
    ice: Palette['primary']
    imaginary: Palette['primary']
    lightning: Palette['primary']
    physical: Palette['primary']
    quantum: Palette['primary']
    wind: Palette['primary']
  }
  interface PaletteOptions {
    brandSRO500?: Palette['primary']
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
    fire?: PaletteOptions['primary']
    ice?: PaletteOptions['primary']
    imaginary?: PaletteOptions['primary']
    lightning?: PaletteOptions['primary']
    physical?: PaletteOptions['primary']
    quantum?: PaletteOptions['primary']
    wind?: PaletteOptions['primary']
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
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
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
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
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
    fire: true
    ice: true
    imaginary: true
    lightning: true
    physical: true
    quantum: true
    wind: true
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
    brandSRO500: commonTheme.palette.augmentColor({
      color: { main: '#324599' },
      name: 'primary',
    }),
    neutral100: commonTheme.palette.augmentColor({
      color: { main: '#E9EBF5' },
    }),
    neutral200: commonTheme.palette.augmentColor({
      color: { main: '#CBCFE1' },
    }),
    neutral300: commonTheme.palette.augmentColor({
      color: { main: '#A2A6BB' },
    }),
    neutral400: commonTheme.palette.augmentColor({
      color: { main: '#777B8E' },
    }),
    neutral500: commonTheme.palette.augmentColor({
      color: { main: '#393C4F' },
    }),
    neutral600: commonTheme.palette.augmentColor({
      color: { main: '#222533' },
    }),
    neutral700: commonTheme.palette.augmentColor({
      color: { main: '#191C2B' },
      name: 'primary',
    }),
    neutral800: commonTheme.palette.augmentColor({
      color: { main: '#0C0F1A' },
      name: 'primary',
    }),
    neutral900: commonTheme.palette.augmentColor({
      color: { main: '#020515' },
      name: 'primary',
    }),
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
    rarity1: commonTheme.palette.augmentColor({
      color: { main: '#838f99', contrastText: '#fff' },
      name: 'rarity1',
    }),
    rarity2: commonTheme.palette.augmentColor({
      color: { main: '#5e966c', contrastText: '#fff' },
      name: 'rarity2',
    }),
    rarity3: commonTheme.palette.augmentColor({
      color: { main: '#499fb3', contrastText: '#fff' },
      name: 'rarity3',
    }),
    rarity4: commonTheme.palette.augmentColor({
      color: { main: '#b886ca', contrastText: '#fff' },
      name: 'rarity4',
    }),
    rarity5: commonTheme.palette.augmentColor({
      color: { main: '#e6ac54', contrastText: '#fff' },
      name: 'rarity5',
    }),
  },
})
