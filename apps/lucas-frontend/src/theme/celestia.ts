import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { theme as giTheme } from '@genshin-optimizer/gi/theme'
import { createTheme } from '@mui/material'

/**
 * Celestia design tokens: near-black violet surfaces, gold accents and hairlines.
 * Element/reaction/rarity colors keep coming from the GI theme.
 */
export const celestia = {
  night: '#070609',
  header: '#0B0A0F',
  stoneDark: '#0C0A10',
  stone: '#0F0D14',
  stoneLight: '#17141F',
  stoneHover: '#1D1925',
  cardBorder: '#231E18',
  hairline: '#352D22',
  hairlineSoft: '#1A1720',
  ornament: '#4A3F2C',
  goldTint: '#1B1710',
  goldTintStrong: '#2A2214',
  gold: '#D9B26A',
  goldLight: '#F1D9A0',
  goldInk: '#17130B',
  text: '#EFE9DC',
  muted: '#ADA48F',
  faint: '#7E7664',
} as const

// Same family for now; kept apart so brand/navigation can diverge from body text later.
export const displayFont = "'Outfit', system-ui, sans-serif"
export const bodyFont = "'Outfit', system-ui, sans-serif"

const radius = 2

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

// Element filters color their selected button with the element itself; every other
// toggle group gets the gold selection. Element buttons are told apart by their value.
const notElementButton = allElementWithPhyKeys
  .map((ele) => `:not([value="${ele}"])`)
  .join('')

const popupPaper = {
  backgroundColor: celestia.header,
  backgroundImage: 'none',
  border: `1px solid ${celestia.hairline}`,
}

export const theme = createTheme(giTheme, {
  shape: { borderRadius: radius },
  palette: {
    background: { default: celestia.night, paper: celestia.stone },
    text: { primary: celestia.text, secondary: celestia.muted },
    divider: celestia.hairlineSoft,
    common: { black: celestia.header },
    primary: color(celestia.gold, 'primary', celestia.goldInk),
    secondary: color('#2C2620', 'secondary', celestia.text),
    info: color('#7AA7D1', 'info'),
    success: color('#5FB88A', 'success'),
    warning: color('#E8A33D', 'warning'),
    error: color('#D9604C', 'error'),
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: celestia.night,
          scrollbarColor: `${celestia.ornament} ${celestia.night}`,
        },
        '::selection': {
          backgroundColor: celestia.gold,
          color: celestia.goldInk,
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: `1px solid ${celestia.cardBorder}` },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: { borderColor: celestia.hairline },
      },
    },
    MuiButtonGroup: {
      styleOverrides: { root: { boxShadow: 'none' } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius, fontWeight: 600 },
        outlined: { borderColor: celestia.hairline },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderColor: celestia.hairline,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        // `&&` doubles the class specificity so these win over SolidToggleButtonGroup's own colors.
        root: {
          '&& .MuiToggleButtonGroup-grouped': {
            borderColor: celestia.hairline,
          },
          '&& .MuiToggleButtonGroup-grouped:not(.Mui-selected)': {
            backgroundColor: celestia.stone,
            color: celestia.faint,
          },
          '&& .MuiToggleButtonGroup-grouped:not(.Mui-selected):hover': {
            backgroundColor: celestia.stoneHover,
            color: celestia.muted,
          },
          [`&& .MuiToggleButtonGroup-grouped.Mui-selected${notElementButton}`]:
            {
              backgroundColor: celestia.goldTintStrong,
              color: celestia.goldLight,
            },
          [`&& .MuiToggleButtonGroup-grouped.Mui-selected${notElementButton}:hover`]:
            {
              backgroundColor: '#352A18',
            },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: celestia.night,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: celestia.hairline,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: celestia.ornament,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: celestia.gold,
          },
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
          '&.Mui-selected': { backgroundColor: celestia.goldTint },
          '&.Mui-selected:hover': { backgroundColor: celestia.goldTintStrong },
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
    MuiDialog: {
      styleOverrides: {
        paper: { border: `1px solid ${celestia.hairline}` },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: celestia.stone,
          border: `1px solid ${celestia.cardBorder}`,
          '&::before': { display: 'none' },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(241, 217, 160, 0.06)' },
      },
    },
  },
})
