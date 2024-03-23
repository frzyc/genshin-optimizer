'use client'
import type { CardProps } from '@mui/material'
import { Card, styled } from '@mui/material'
export type CardBackgroundColor = 'light' | 'dark' | 'normal'
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
})<StyledCardProps>(({ theme, bgt }) => ({
  backgroundColor:
    bgt === 'light'
      ? theme.palette.contentLight.main
      : bgt === 'dark'
      ? theme.palette.contentDark.main
      : theme.palette.contentNormal.main,
}))
