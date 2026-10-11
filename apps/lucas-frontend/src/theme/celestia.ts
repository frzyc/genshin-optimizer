import { theme as giTheme } from '@genshin-optimizer/gi/theme'
import { createTheme } from '@mui/material'

/**
 * Celestia design tokens: near-black violet surfaces, gold accents and hairlines.
 * Element/reaction colors keep coming from the GI theme.
 */
export const celestia = {
  night: '#070609',
  header: '#0B0A0F',
  stoneDark: '#0C0A10',
  stone: '#0F0D14',
  stoneLight: '#17141F',
  hairline: '#352D22',
  hairlineSoft: '#1A1720',
  ornament: '#4A3F2C',
  gold: '#D9B26A',
  goldLight: '#F1D9A0',
  text: '#EFE9DC',
  muted: '#ADA48F',
  faint: '#7E7664',
} as const

// Same family for now; kept apart so brand/navigation can diverge from body text later.
export const displayFont = "'Outfit', system-ui, sans-serif"
export const bodyFont = "'Outfit', system-ui, sans-serif"

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

const color = (main: string, name: string) =>
  giTheme.palette.augmentColor({ color: { main }, name })

export const theme = createTheme(giTheme, {
  palette: {
    background: { default: celestia.night, paper: celestia.stone },
    text: { primary: celestia.text, secondary: celestia.muted },
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
})
