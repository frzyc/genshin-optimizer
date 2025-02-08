'use client'
import type { CardProps, Palette, PaletteColor } from '@mui/material'
import { Card, styled } from '@mui/material'

export type CardBackgroundColor = 'light' | 'dark' | 'normal'
const bgMap = {
  light: 'contentLight',
  dark: 'contentDark',
  normal: 'contentNormal',
} as const

interface StyledCardProps extends CardProps {
  bgt?: CardBackgroundColor
}
/**
 * A colored Card that is by default `contentNormal` colored.
 *
 * Use bgt=["light", "dark"] to use [`contentLight`, `contentDark`]
 */
export const CardThemed = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'bgt',
})<StyledCardProps>(({ theme, bgt }) => {
  const palette = bgMap[bgt || 'normal'] as keyof Palette
  const paletteColor = theme.palette[palette] as PaletteColor
  return {
    backgroundColor: paletteColor?.main,
  }
})
