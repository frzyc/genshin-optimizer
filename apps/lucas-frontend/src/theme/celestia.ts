import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { theme as giTheme } from '@genshin-optimizer/gi/theme'
import type { Palette, PaletteColor, ThemeOptions } from '@mui/material'
import { alpha, createTheme, lighten } from '@mui/material'

/**
 * Celestia design tokens: cool near-black surfaces with neutral hairlines; gold is an
 * accent only (brand, active navigation, focus, sliders). Element/reaction/rarity
 * colors keep coming from the GI theme.
 */
export const celestia = {
  night: '#09090D',
  header: '#0D0D12',
  stoneDark: '#0F0F15',
  stone: '#14141B',
  stoneLight: '#1B1B24',
  stoneHover: '#22222D',
  selected: '#2A2936',
  hairline: '#25242F',
  hairlineSoft: '#1C1B24',
  hairlineStrong: '#363445',
  fieldOutline: '#2B2A36',
  fieldOutlineHover: '#4A4859',
  toggleOn: '#22222D',
  toggleOnHover: '#2C2B38',
  toggleOff: '#1A1A22',
  toggleOffHover: '#202029',
  chipOn: '#34333F',
  chipOff: '#25242F',
  goldHover: '#E8C886',
  ornament: '#5A4C33',
  gold: '#D9B26A',
  goldLight: '#F1D9A0',
  goldInk: '#17130B',
  text: '#E9E7EF',
  muted: '#A3A0B3',
  faint: '#827F96',
} as const

// Same family for now; kept apart so brand/navigation can diverge from body text later.
export const displayFont = "'Outfit', system-ui, sans-serif"
export const bodyFont = "'Outfit', system-ui, sans-serif"

const radius = 4

// The GI theme already expanded every variant with its own fontFamily, so each one is overridden.
const typographyVariants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
] as const

const color = (main: string, name: string, contrastText?: string) =>
  giTheme.palette.augmentColor({ color: { main, contrastText }, name })

/** A palette color that can be tinted, or undefined for "inherit"/"default"/custom strings. */
function paletteColor(palette: Palette, key: unknown) {
  const pc = palette[key as keyof Palette] as PaletteColor | undefined
  return pc && typeof pc === 'object' && 'main' in pc ? pc : undefined
}

/** Tonal fill: a faint tint of the color with readable colored text, instead of a solid block. */
const tonal = (main: string, strength = 0.16) => ({
  backgroundColor: alpha(main, strength),
  color: lighten(main, 0.35),
})
const neutralFill = {
  backgroundColor: celestia.stoneHover,
  color: celestia.muted,
}

// Element filters color their selected button with the element itself; every other
// toggle group gets the neutral selection. Element buttons are told apart by their value.
const notElementButton = allElementWithPhyKeys
  .map((ele) => `:not([value="${ele}"])`)
  .join('')

const popupPaper = {
  backgroundColor: celestia.header,
  backgroundImage: 'none',
  border: `1px solid ${celestia.hairline}`,
}

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: celestia.night,
        scrollbarColor: `${celestia.hairlineStrong} ${celestia.night}`,
      },
      '::selection': {
        backgroundColor: alpha(celestia.gold, 0.35),
        color: celestia.text,
      },
      // Some upstream fields hardcode a light outline via sx; force the soft field outline instead.
      '.MuiOutlinedInput-root:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
        { borderColor: `${celestia.fieldOutline} !important` },
      '.MuiOutlinedInput-root:not(.Mui-focused):not(.Mui-error):hover .MuiOutlinedInput-notchedOutline':
        { borderColor: `${celestia.fieldOutlineHover} !important` },
    },
  },
  MuiPaper: {
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiButton: {
    styleOverrides: {
      root: { fontWeight: 600 },
      contained: ({ ownerState, theme }: any) => {
        if (ownerState.color === 'secondary')
          return {
            ...neutralFill,
            color: celestia.text,
            '&:hover': { backgroundColor: celestia.selected },
          }
        const pc = paletteColor(theme.palette, ownerState.color ?? 'primary')
        if (!pc) return {}
        return {
          ...tonal(pc.main),
          '&:hover': { backgroundColor: alpha(pc.main, 0.26) },
        }
      },
      outlined: { borderColor: celestia.hairline },
    },
  },
  MuiButtonGroup: {
    styleOverrides: {
      root: { boxShadow: 'none' },
      // dark gaps between grouped buttons instead of light separator lines
      grouped: { borderColor: `${celestia.night} !important` },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: ({ ownerState, theme }: any) => {
        const base = { borderRadius: radius, fontWeight: 600 }
        if (ownerState.variant === 'outlined')
          return { ...base, borderColor: celestia.hairline }
        if (ownerState.color === 'secondary') return { ...base, ...neutralFill }
        const pc =
          ownerState.color !== 'default' &&
          paletteColor(theme.palette, ownerState.color)
        return pc ? { ...base, ...tonal(pc.main, 0.2) } : base
      },
    },
  },
  // Custom styled component from common/ui (name: 'SqBadge'): same tonal treatment as chips.
  SqBadge: {
    styleOverrides: {
      root: ({ theme, color = 'primary' }: any) => {
        if (color === 'secondary') return neutralFill
        const pc = paletteColor(theme.palette, color)
        return pc ? tonal(pc.main, 0.2) : {}
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: { fontWeight: 600, border: 0 },
    },
  },
  // Toggle groups: one continuous bar split by thin dark lines. Selected segments get light
  // text and a gold underline, like the active navbar item; idle ones are dimmed.
  // `&&` doubles the class specificity so these win over SolidToggleButtonGroup's own colors;
  // !important beats MUI's first/middle/last segment rules that reset borders, margins and radii.
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        borderRadius: radius,
        overflow: 'hidden',
        '&& .MuiToggleButtonGroup-grouped': {
          border: '0 !important',
          margin: '0 !important',
          borderRadius: '0 !important',
        },
        '&& .MuiToggleButtonGroup-groupedHorizontal:not(:first-of-type)': {
          borderLeft: `1px solid ${celestia.night} !important`,
        },
        '&& .MuiToggleButtonGroup-groupedVertical:not(:first-of-type)': {
          borderTop: `1px solid ${celestia.night} !important`,
        },
        '&& .MuiToggleButtonGroup-grouped:not(.Mui-selected)': {
          backgroundColor: celestia.toggleOff,
          color: celestia.faint,
        },
        '&& .MuiToggleButtonGroup-grouped:not(.Mui-selected):hover': {
          backgroundColor: celestia.toggleOffHover,
          color: celestia.muted,
        },
        [`&& .MuiToggleButtonGroup-grouped.Mui-selected${notElementButton}`]: {
          backgroundColor: celestia.toggleOn,
          color: '#FFFFFF',
          boxShadow: `inset 0 -2px 0 ${celestia.gold}`,
        },
        [`&& .MuiToggleButtonGroup-grouped.Mui-selected${notElementButton}:hover`]:
          {
            backgroundColor: celestia.toggleOnHover,
            boxShadow: `inset 0 -2px 0 ${celestia.goldHover}`,
          },
        // count chips inside the segments
        '&& .MuiToggleButtonGroup-grouped .MuiChip-root': {
          backgroundColor: celestia.chipOff,
          color: 'inherit',
        },
        [`&& .MuiToggleButtonGroup-grouped.Mui-selected${notElementButton} .MuiChip-root`]:
          {
            backgroundColor: celestia.chipOn,
          },
      },
    },
  },
  // Fields: faint fill plus a soft outline (between the old white line and nothing); gold on focus.
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: celestia.fieldOutline,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: celestia.fieldOutlineHover,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: celestia.gold,
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      filled: ({ ownerState, theme }: any) => {
        const pc = paletteColor(
          theme.palette,
          ownerState.color ?? ownerState.severity
        )
        if (!pc) return {}
        const text = lighten(pc.main, 0.35)
        return {
          ...tonal(pc.main),
          '& .MuiAlert-icon': { color: text },
          '& a': { color: text },
        }
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: { backgroundColor: celestia.gold, height: 2 },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        fontFamily: displayFont,
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: celestia.muted,
        '&.Mui-selected': { color: celestia.goldLight },
      },
    },
  },
  MuiPopover: {
    styleOverrides: { paper: popupPaper },
  },
  MuiAutocomplete: {
    styleOverrides: { paper: popupPaper },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        '&.Mui-selected': { backgroundColor: celestia.stoneHover },
        '&.Mui-selected:hover': { backgroundColor: celestia.selected },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: celestia.header,
        border: `1px solid ${celestia.hairline}`,
        color: celestia.text,
        fontSize: 13,
      },
      arrow: { color: celestia.header },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundColor: celestia.stone,
        '&::before': { display: 'none' },
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    },
  },
} as ThemeOptions['components']

export const theme = createTheme(giTheme, {
  shape: { borderRadius: radius },
  palette: {
    background: { default: celestia.night, paper: celestia.stone },
    text: { primary: celestia.text, secondary: celestia.muted },
    divider: celestia.hairline,
    common: { black: celestia.header },
    primary: color(celestia.gold, 'primary', celestia.goldInk),
    secondary: color('#2A2936', 'secondary', celestia.text),
    info: color('#5BA7E8', 'info'),
    success: color('#4FC48E', 'success'),
    warning: color('#F0B44C', 'warning'),
    error: color('#F0675A', 'error'),
    contentDark: color(celestia.stoneDark, 'contentDark'),
    contentNormal: color(celestia.stone, 'contentNormal'),
    contentLight: color(celestia.stoneLight, 'contentLight'),
    brand500: color(celestia.gold, 'brand500'),
    neutral700: color(celestia.stoneLight, 'neutral700'),
    neutral800: color(celestia.header, 'neutral800'),
    neutral900: color(celestia.night, 'neutral900'),
  },
  typography: {
    fontFamily: bodyFont,
    ...Object.fromEntries(
      typographyVariants.map((variant) => [variant, { fontFamily: bodyFont }])
    ),
  },
  components,
})
