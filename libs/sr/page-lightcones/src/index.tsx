import { LightConeEditor, LightConeInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function PageLightCones() {
  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <LightConeEditor />
      <LightConeInventory />
    </Box>
  )
}
