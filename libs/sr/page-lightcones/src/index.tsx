import { LightConeEditor, LightConeInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

import { useState } from 'react'

export default function PageLightCones() {
  const [lightConeIdToEdit, setLightConeIdToEdit] = useState('')

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <LightConeEditor
        lightConeIdToEdit={lightConeIdToEdit}
        cancelEdit={() => setLightConeIdToEdit('')}
      />
      <LightConeInventory
        onAdd={() => setLightConeIdToEdit('new')}
        onEdit={setLightConeIdToEdit}
      />
    </Box>
  )
}
