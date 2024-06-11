import { RelicEditor, RelicInventory } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

import { useState } from 'react'

export default function PageRelics() {
  const [relicIdToEdit, setRelicIdToEdit] = useState('')

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <RelicEditor
        relicIdToEdit={relicIdToEdit}
        cancelEdit={() => setRelicIdToEdit('')}
        allowEmpty
      />
      <RelicInventory
        onAdd={() => setRelicIdToEdit('new')}
        onEdit={setRelicIdToEdit}
      />
    </Box>
  )
}
