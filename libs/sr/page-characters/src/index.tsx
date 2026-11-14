import { CharacterInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function PageCharacters() {
  return (
    <Box
      sx={{
        my: 1,
      }}
    >
      <CharacterInventory />
    </Box>
  )
}
