import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterCardEquipmentRow,
  CharacterCardHeader,
  CharacterCardHeaderContent,
  CharacterCardStats,
} from '@genshin-optimizer/gi/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, memo } from 'react'

export const OptCharacterCard = memo(function OptCharacterCard({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return (
    <CardThemed bgt="light">
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={600} />}
      >
        <CharacterCardHeader characterKey={characterKey}>
          <CharacterCardHeaderContent characterKey={characterKey} />
        </CharacterCardHeader>
        <Box
          sx={{
            p: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <CharacterCardEquipmentRow />
        </Box>
        <CharacterCardStats bgt="light" />
      </Suspense>
    </CardThemed>
  )
})
