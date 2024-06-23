import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
    brandGO500: Palette['primary']
    neutral200: Palette['primary']
    neutral300: Palette['primary']
    neutral400: Palette['primary']
    neutral700: Palette['primary']
    neutral800: Palette['primary']

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
    geo: Palette['primary']
    dendro: Palette['primary']
    pyro: Palette['primary']
    hydro: Palette['primary']
    cryo: Palette['primary']
    electro: Palette['primary']
    anemo: Palette['primary']
    physical: Palette['primary']
    vaporize: Palette['primary']
    melt: Palette['primary']
    spread: Palette['primary']
    aggravate: Palette['primary']
    overloaded: Palette['primary']
    superconduct: Palette['primary']
    electrocharged: Palette['primary']
    shattered: Palette['primary']
    swirl: Palette['primary']
    burning: Palette['primary']
    crystallize: Palette['primary']
    heal: Palette['primary']
    bloom: Palette['primary']
    burgeon: Palette['primary']
    hyperbloom: Palette['primary']
  }
  interface PaletteOptions {
    brandGO500?: Palette['primary']
    neutral200?: Palette['primary']
    neutral300?: Palette['primary']
    neutral400?: Palette['primary']
    neutral700?: Palette['primary']
    neutral800?: Palette['primary']

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
    geo?: PaletteOptions['primary']
    dendro?: PaletteOptions['primary']
    pyro?: PaletteOptions['primary']
    hydro?: PaletteOptions['primary']
    cryo?: PaletteOptions['primary']
    electro?: PaletteOptions['primary']
    anemo?: PaletteOptions['primary']
    physical?: PaletteOptions['primary']
    vaporize?: PaletteOptions['primary']
    melt?: PaletteOptions['primary']
    spread?: PaletteOptions['primary']
    aggravate?: PaletteOptions['primary']
    overloaded?: PaletteOptions['primary']
    superconduct?: PaletteOptions['primary']
    electrocharged?: PaletteOptions['primary']
    shattered?: PaletteOptions['primary']
    swirl?: PaletteOptions['primary']
    burning?: PaletteOptions['primary']
    crystallize?: PaletteOptions['primary']
    heal?: PaletteOptions['primary']
    bloom?: PaletteOptions['primary']
    burgeon?: PaletteOptions['primary']
    hyperbloom?: PaletteOptions['primary']
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
    geo: true
    dendro: true
    pyro: true
    hydro: true
    cryo: true
    electro: true
    anemo: true
    physical: true
    vaporize: true
    melt: true
    spread: true
    aggravate: true
    overloaded: true
    superconduct: true
    electrocharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
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
    geo: true
    dendro: true
    pyro: true
    hydro: true
    cryo: true
    electro: true
    anemo: true
    physical: true
    vaporize: true
    melt: true
    spread: true
    aggravate: true
    overloaded: true
    superconduct: true
    electrocharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
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
    geo: true
    dendro: true
    pyro: true
    hydro: true
    cryo: true
    electro: true
    anemo: true
    physical: true
    vaporize: true
    melt: true
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
    geo: true
    dendro: true
    pyro: true
    hydro: true
    cryo: true
    electro: true
    anemo: true
    physical: true
    vaporize: true
    melt: true
    spread: true
    aggravate: true
    overloaded: true
    superconduct: true
    electrocharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
  }
}

export const theme = createTheme({
  ...commonTheme,
  palette: {
    ...commonTheme.palette,
    brandGO500: commonTheme.palette.augmentColor({
      color: { main: '#324599' },
      name: 'primary',
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
    neutral700: commonTheme.palette.augmentColor({
      color: { main: '#191C2B' },
      name: 'primary',
    }),
    neutral800: commonTheme.palette.augmentColor({
      color: { main: '#0C0F1A' },
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
    geo: commonTheme.palette.augmentColor({
      color: { main: '#f8ba4e', contrastText: '#fff' },
      name: 'geo',
    }),
    dendro: commonTheme.palette.augmentColor({
      color: { main: '#a5c83b', contrastText: '#fff' },
      name: 'dendro',
    }),
    pyro: commonTheme.palette.augmentColor({
      color: { main: '#FF3C32' },
      name: 'pyro',
    }),
    hydro: commonTheme.palette.augmentColor({
      color: { main: '#5680ff' },
      name: 'hydro',
    }),
    cryo: commonTheme.palette.augmentColor({
      color: { main: '#77a2e6', contrastText: '#fff' },
      name: 'cryo',
    }),
    electro: commonTheme.palette.augmentColor({
      color: { main: '#b25dcd' },
      name: 'electro',
    }),
    anemo: commonTheme.palette.augmentColor({
      color: { main: '#61dbbb', contrastText: '#fff' },
      name: 'anemo',
    }),
    physical: commonTheme.palette.augmentColor({
      color: { main: '#aaaaaa' },
      name: 'physical',
    }),
    vaporize: commonTheme.palette.augmentColor({
      color: { main: '#ffcb65' },
      name: 'vaporize',
    }),
    melt: commonTheme.palette.augmentColor({
      color: { main: '#ffcb65' },
      name: 'melt',
    }),
    spread: commonTheme.palette.augmentColor({
      color: { main: '#3bc8a7', contrastText: '#fff' },
      name: 'spread',
    }),
    aggravate: commonTheme.palette.augmentColor({
      color: { main: '#3ba0c8', contrastText: '#fff' },
      name: 'aggravate',
    }),
    overloaded: commonTheme.palette.augmentColor({
      color: { main: '#ff7e9a' },
      name: 'overloaded',
    }),
    superconduct: commonTheme.palette.augmentColor({
      color: { main: '#b7b1ff' },
      name: 'superconduct',
    }),
    electrocharged: commonTheme.palette.augmentColor({
      color: { main: '#e299fd' },
      name: 'electrocharged',
    }),
    shattered: commonTheme.palette.augmentColor({
      color: { main: '#98fffd' },
      name: 'shattered',
    }),
    swirl: commonTheme.palette.augmentColor({
      color: { main: '#66ffcb' },
      name: 'swirl',
    }),
    burning: commonTheme.palette.augmentColor({
      color: { main: '#bf2818' },
      name: 'burning',
    }),
    crystallize: commonTheme.palette.augmentColor({
      color: { main: '#f8ba4e' },
      name: 'crystallize',
    }),
    heal: commonTheme.palette.augmentColor({
      color: { main: '#c0e86c' },
      name: 'heal',
    }),
    bloom: commonTheme.palette.augmentColor({
      color: { main: '#47c83b', contrastText: '#fff' },
      name: 'bloom',
    }),
    burgeon: commonTheme.palette.augmentColor({
      color: { main: '#c8b33b', contrastText: '#fff' },
      name: 'burgeon',
    }),
    hyperbloom: commonTheme.palette.augmentColor({
      color: { main: '#3b8dc8', contrastText: '#fff' },
      name: 'hyperbloom',
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
