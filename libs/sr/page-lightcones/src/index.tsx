import { LightConeEditor, LightConeInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'
import { Suspense } from 'react'

export default function PageLightCones() {
  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={false}>
        <LightConeEditor />
        <LightConeInventory />
      </Suspense>
    </Box>
  )
}
