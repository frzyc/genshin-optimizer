import type { CardProps } from '@mui/material'
import { Card, styled } from '@mui/material'
interface StyledCardProps extends CardProps {
  bgt?: 'light' | 'dark'
}
export const CardThemed = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'bgt',
})<StyledCardProps>(({ theme, bgt }) => ({
  backgroundColor:
    bgt === 'light'
      ? theme.palette.contentLight.main
      : bgt === 'dark'
      ? theme.palette.contentDarker.main
      : theme.palette.contentDark.main,
}))
