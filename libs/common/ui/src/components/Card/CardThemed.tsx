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
export const CardThemed = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'bgt',
})<StyledCardProps>(({ theme, bgt }) => {
  if (!bgt) bgt = 'normal'
  switch (bgt) {
    case 'light':
      bgt = theme.palette.contentLight.main
      break
    case 'dark':
      bgt = theme.palette.contentDark.main
      break
    case 'normal':
      bgt = theme.palette.contentNormal.main
      break
    default:
      bgt = (theme.palette[bgt as keyof Palette] as PaletteColor)?.main
  }
  return {
    backgroundColor: bgt,
  }
})
