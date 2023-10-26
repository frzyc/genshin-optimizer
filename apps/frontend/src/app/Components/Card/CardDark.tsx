import { Card, styled } from '@mui/material'

/**
 * @deprecated use CardThemed
 */
const CardDark = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.contentNormal.main,
}))

export default CardDark
