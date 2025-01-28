import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscEditor, DiscInventory } from '@genshin-optimizer/zzz/ui'
import { Box } from '@mui/material'

import { useCallback, useState } from 'react'
import DiscFilter from './DiscFilter'

export default function PageDiscs() {
  const [disc, setDisc] = useState<Partial<ICachedDisc>>({})
  const [show, onOpen, onClose] = useBoolState()
  const { database } = useDatabaseContext()
  const onAddNew = useCallback(() => {
    setDisc({})
    onOpen()
  }, [onOpen])
  const onEdit = useCallback(
    (id: string) => {
      const disc = database.discs.get(id)
      if (disc) {
        setDisc(disc)
        onOpen()
      }
    },
    [database.discs, onOpen]
  )

  const allDiscs = database.discs.values
  const allDiscids = allDiscs.map((disc) => disc.id)

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <DiscFilter
        numShowing={allDiscs.length}
        total={allDiscs.length}
        discIds={allDiscids}
      ></DiscFilter>
      <DiscEditor
        disc={disc}
        allowEmpty
        allowUpload
        show={show}
        onClose={onClose}
        onShow={onOpen}
      />
      <DiscInventory onAdd={onAddNew} onEdit={onEdit} />
    </Box>
  )
}
