import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/common/ui'

declare module '@mui/material/styles' {
  interface Palette {
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
    lunarcharged: Palette['primary']
    shattered: Palette['primary']
    swirl: Palette['primary']
    burning: Palette['primary']
    crystallize: Palette['primary']
    heal: Palette['primary']
    bloom: Palette['primary']
    burgeon: Palette['primary']
    hyperbloom: Palette['primary']
    lunarbloom: Palette['primary']
    lunarcrystallize: Palette['primary']
  }

  interface PaletteOptions {
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
    lunarcharged?: PaletteOptions['primary']
    shattered?: PaletteOptions['primary']
    swirl?: PaletteOptions['primary']
    burning?: PaletteOptions['primary']
    crystallize?: PaletteOptions['primary']
    heal?: PaletteOptions['primary']
    bloom?: PaletteOptions['primary']
    burgeon?: PaletteOptions['primary']
    hyperbloom?: PaletteOptions['primary']
    lunarbloom?: PaletteOptions['primary']
    lunarcrystallize?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
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
    lunarcharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
    lunarbloom: true
    lunarcrystallize: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
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
    lunarcharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
    lunarbloom: true
    lunarcrystallize: true
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
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
    lunarcharged: true
    shattered: true
    swirl: true
    burning: true
    crystallize: true
    heal: true
    bloom: true
    burgeon: true
    hyperbloom: true
    lunarbloom: true
    lunarcrystallize: true
  }
}

export const theme = createTheme({
  ...commonTheme,
  palette: {
    ...commonTheme.palette,
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
    lunarcharged: commonTheme.palette.augmentColor({
      color: { main: '#ecb8ff' },
      name: 'lunarcharged',
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
    lunarbloom: commonTheme.palette.augmentColor({
      color: { main: '#c8efc4', contrastText: '#fff' },
      name: 'lunarbloom',
    }),
    lunarcrystallize: commonTheme.palette.augmentColor({
      color: { main: '#fff2baff', contrastText: '#fff' },
      name: 'lunarcrystallize',
    }),
  },
})
