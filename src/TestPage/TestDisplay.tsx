import { Box } from '@mui/material'
import { lazy } from 'react'

const CharacterDisplayCard = lazy(() => import('../Character/CharacterDisplayCard'))
export default function TestDisplay() {
  return <Box sx={{ py: 1 }}>
    <CharacterDisplayCard characterKey="Traveler" tabName="talent" />
  </Box>
}
