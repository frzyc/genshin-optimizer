import { RelicEditor, RelicInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function PageRelics() {
  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <RelicEditor />
      <RelicInventory />
    </Box>
  )
}
