import { Card, styled } from '@mui/material'

/**
 * @deprecated use CardThemed with bgt="light"
 */
const CardLight = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.contentLight.main,
}))

export default CardLight
