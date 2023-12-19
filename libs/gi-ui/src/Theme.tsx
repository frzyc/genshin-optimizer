import { createTheme } from '@mui/material'

import { theme as commonTheme } from '@genshin-optimizer/ui-common'

declare module '@mui/material/styles' {
  interface Palette {
    roll1: Palette['primary']
    roll2: Palette['primary']
    roll3: Palette['primary']
    roll4: Palette['primary']
    roll5: Palette['primary']
    roll6: Palette['primary']
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
    roll1?: PaletteOptions['primary']
    roll2?: PaletteOptions['primary']
    roll3?: PaletteOptions['primary']
    roll4?: PaletteOptions['primary']
    roll5?: PaletteOptions['primary']
    roll6?: PaletteOptions['primary']
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
      color: { main: '#bf2818' },
      name: 'pyro',
    }),
    hydro: commonTheme.palette.augmentColor({
      color: { main: '#2f63d4' },
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
  },
})
