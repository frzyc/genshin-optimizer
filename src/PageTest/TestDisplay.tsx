import { Box } from '@mui/material'
import { lazy } from 'react'

const CharacterDisplayCard = lazy(() => import('../PageCharacter/CharacterDisplayCard'))
export default function TestDisplay() {
  return <Box sx={{ py: 1 }}>
    <CharacterDisplayCard characterKey="Shenhe" tabName="talent" />
  </Box>
}
