import { DiscEditor, DiscInventory } from '@genshin-optimizer/zzz/ui'
import { Box } from '@mui/material'

import { useState } from 'react'

export default function PageDiscs() {
  const [discIdToEdit, setDiscIdToEdit] = useState('')

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <DiscEditor
        discIdToEdit={discIdToEdit}
        cancelEdit={() => setDiscIdToEdit('')}
        allowEmpty
      />
      <DiscInventory
        onAdd={() => setDiscIdToEdit('new')}
        onEdit={setDiscIdToEdit}
      />
    </Box>
  )
}
