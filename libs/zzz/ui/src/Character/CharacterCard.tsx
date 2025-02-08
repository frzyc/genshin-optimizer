import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'

import { Box, Skeleton } from '@mui/material'
import { Suspense } from 'react'
import { CharacterCardEquipmentRow, CharacterCardHeader } from './index'

export function CharacterCard({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={300} />}
    >
      <CardThemed
        bgt="light"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
        }}
      >
        <ExistingCharacterCardContent characterKey={characterKey} />
      </CardThemed>
    </Suspense>
  )
}

type ExistingCharacterCardContentProps = {
  characterKey: CharacterKey
}
function ExistingCharacterCardContent({
  characterKey,
}: ExistingCharacterCardContentProps) {
  return (
    <CardThemed sx={{ borderRadius: '20px' }}>
      <Box
        sx={(_) => ({
          p: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          position: 'relative',
          background: '#95eae9',
          height: '270px',
          padding: 0,
        })}
      >
        <CharacterCardEquipmentRow characterKey={characterKey} />
      </Box>
      <Box
        sx={(_) => ({
          padding: '8px 8px 8px 20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          position: 'relative',
          background: '#2c2c2c',
        })}
      >
        <CharacterCardHeader characterKey={characterKey} />
      </Box>
    </CardThemed>
  )
}
