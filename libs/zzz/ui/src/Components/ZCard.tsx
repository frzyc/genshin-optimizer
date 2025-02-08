'use client'
import type { CardProps, Palette, PaletteColor } from '@mui/material'
import { Card, styled } from '@mui/material'
export type CardBackgroundColor = 'light' | 'dark' | 'normal'
interface StyledCardProps extends CardProps {
  bgt?: CardBackgroundColor | string
}
/**
 * A colored Card that is by default `contentNormal` colored.
 *
 * Use bgt=["light", "dark"] to use [`contentLight`, `contentDark`]
 */
export const ZCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'bgt',
})<StyledCardProps>(({ theme, bgt }) => {
  if (!bgt) bgt = 'normal'
  switch (bgt) {
    case 'light':
      bgt = 'contentLight'
      break
    case 'dark':
      bgt = 'contentDark'
      break
    case 'normal':
    default:
      bgt = 'contentNormal'
      break
  }

  return {
    backgroundColor: (theme.palette[bgt as keyof Palette] as PaletteColor)
      ?.main,
    border: `4px ${
      (theme.palette[bgt as keyof Palette] as PaletteColor)?.light
    } solid`,
  }
})
